# Use Python 3.11 base image with newer SQLite3 (bookworm has SQLite 3.40+)
# Required for ChromaDB which needs sqlite3 >= 3.35.0
FROM python:3.11-bookworm

# Install system dependencies (Ollama removed - using OpenAI + RAG instead)
RUN apt-get update && \
    apt-get install -y curl bash && \
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
echo ""

# Start FastAPI (using OpenAI + RAG, no Ollama needed)
echo "[1/2] Starting FastAPI application..."
echo "    ✓ FastAPI will be available at http://0.0.0.0:${PORT:-8000}"
echo "    ✓ Health check endpoint: /health"
echo "    ✓ Using OpenAI + RAG for AI features"

# Change to server_py directory
echo "[2/2] Changing to server_py directory..."
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
