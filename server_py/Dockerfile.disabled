FROM python:3.11-slim

# Install Ollama
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Copy Python app
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Start Ollama service and pull model
RUN ollama serve & sleep 5 && ollama pull llama3.2

# Expose port
EXPOSE 8000

CMD ["sh", "-c", "ollama serve & uvicorn main:app --host 0.0.0.0 --port $PORT"]

