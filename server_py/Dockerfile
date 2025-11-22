FROM python:3.11

# Install system dependencies including bash
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Copy and install Python dependencies first (better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create startup script that will run on container start
COPY <<EOF /app/start.sh
#!/bin/bash
set -e

echo "🚀 Starting Ollama service..."
ollama serve > /tmp/ollama.log 2>&1 &
OLLAMA_PID=\$!

echo "⏳ Waiting for Ollama to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama is ready!"
        break
    fi
    echo "Waiting... (\$i/30)"
    sleep 2
done

echo "📦 Pulling llama3.2 model in background..."
(ollama pull llama3.2 && echo "✅ Model downloaded successfully") &

echo "🐍 Starting Python FastAPI server..."
exec uvicorn main:app --host 0.0.0.0 --port \${PORT:-8000}
EOF

RUN chmod +x /app/start.sh

# Expose port
EXPOSE 8000

# Use the startup script
CMD ["/bin/bash", "/app/start.sh"]

