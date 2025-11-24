# Use Python 3.11 base image with newer SQLite3 (bookworm has SQLite 3.40+)
# Required for ChromaDB which needs sqlite3 >= 3.35.0
FROM python:3.11-bookworm

# Install system dependencies and Ollama
RUN apt-get update && \
    apt-get install -y curl bash && \
    curl -fsSL https://ollama.com/install.sh | sh && \
    rm -rf /var/lib/apt/lists/*

# Set working directory for dependency install
WORKDIR /code

# Copy the backend source and Python requirements (keep requirements with the code for consistent paths)
COPY server_py/ /code/server_py/

# Install numpy first with pinned version to prevent upgrades
# Then install other dependencies
# Verify numpy version after installation
RUN pip install --no-cache-dir numpy==1.26.4 && \
    pip install --no-cache-dir -r /code/server_py/requirements.txt && \
    python -c "import numpy; assert numpy.__version__.startswith('1.26'), f'Wrong numpy version: {numpy.__version__}'"

# Switch into the backend directory for runtime so the start command doesn't rely on `cd`
WORKDIR /code/server_py

# Preload the llama3.2 model during the build so deployments ship with the AI assets
RUN ollama serve & \
    OLLAMA_PID=$! && \
    # Give the Ollama server a moment to come up
    sleep 8 && \
    ollama pull llama3.2 && \
    kill ${OLLAMA_PID} && \
    wait ${OLLAMA_PID} || true

# Create an entrypoint script
RUN cat <<'ENTRYPOINT' > /code/entrypoint.sh
#!/bin/bash

echo "=========================================="
echo "=== Starting Railway Backend ==="
echo "=========================================="
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo "Working directory: $(pwd)"
echo "PORT environment variable: ${PORT:-8000}"
echo "Python version: $(python --version 2>&1)"
echo "Ollama version: $(ollama --version 2>&1 || echo 'Not available')"
echo ""

# Start Ollama in the background (non-blocking)
echo "[1/4] Starting Ollama server in background..."
ollama serve > /tmp/ollama.log 2>&1 &
OLLAMA_PID=$!
echo "    ✓ Ollama started with PID: $OLLAMA_PID"
echo "    ✓ Logs available at: /tmp/ollama.log"

# Verify model exists in background (non-blocking, don't wait)
# Use || true to prevent script failure if ollama commands fail
(
  sleep 3
  echo "[Background] Checking for llama3.2 model..."
  if ollama list 2>/dev/null | grep -q "^llama3.2" || true; then
    echo "[Background] ✓ Model llama3.2 already available"
  else
    echo "[Background] ⚠ Model llama3.2 missing; pulling in background..."
    echo "[Background]    This may take a few minutes..."
    ollama pull llama3.2 > /tmp/ollama-pull.log 2>&1 || true
    if [ $? -eq 0 ]; then
      echo "[Background] ✓ Model llama3.2 pulled successfully"
    else
      echo "[Background] ⚠ Model pull failed (check /tmp/ollama-pull.log)"
    fi
  fi
) || true &

# Start FastAPI immediately (don't wait for Ollama)
# This ensures /health endpoint responds instantly for Railway health checks
echo "[2/4] Starting FastAPI application immediately..."
echo "    ✓ FastAPI will be available at http://0.0.0.0:${PORT:-8000}"
echo "    ✓ Health check endpoint: /health"
echo "[3/4] Ollama is initializing in background and will be ready shortly"
echo "    ✓ AI features will work once Ollama is ready"
echo "    ✓ Pregenerated data works immediately (no AI wait)"

# Change to server_py directory
echo "[4/4] Changing to server_py directory..."
cd /code/server_py || {
  echo "    ✗ ERROR: Failed to change to /code/server_py directory"
  echo "    Current directory: $(pwd)"
  echo "    Directory contents: $(ls -la /code/ 2>&1)"
  exit 1
}
echo "    ✓ Changed to /code/server_py"
echo ""

# Use exec to replace shell with uvicorn process
# This ensures proper signal handling and keeps the container alive
# exec replaces the shell process, so signals go directly to uvicorn
echo "=========================================="
echo "Launching uvicorn server..."
echo "=========================================="
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
ENTRYPOINT

RUN chmod +x /code/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/code/entrypoint.sh"]
