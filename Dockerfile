# Use Python 3.11 base image
FROM python:3.11-bullseye

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
set -euo pipefail

# Start Ollama in the background
ollama serve &
OLLAMA_PID=$!

echo "Waiting for Ollama to initialize..."
for i in {1..30}; do
  if curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo "Ollama is ready"
    break
  fi
  echo "Waiting for Ollama... ($i/30)"
  sleep 2
done

# Ensure the llama3.2 model exists (preloaded during build, but verify)
if ! ollama list | grep -q "^llama3.2"; then
  echo "Model llama3.2 missing; pulling now..."
  ollama pull llama3.2
fi

echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
ENTRYPOINT

RUN chmod +x /code/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/code/entrypoint.sh"]
