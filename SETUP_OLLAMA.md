# Setup Ollama (Local LLM)

This project uses **Ollama** to run a free local LLM (Large Language Model) instead of paying for OpenAI.

## 1. Install Ollama

### macOS / Linux
Download and run the installer from [ollama.com/download](https://ollama.com/download).

Or via Homebrew (macOS):
```bash
brew install ollama
```

### Windows
Download the Windows preview from [ollama.com/download](https://ollama.com/download).

## 2. Pull the Model

We recommend `llama3.2` (efficient and capable) or `llama3.1`.

Open your terminal and run:

```bash
ollama pull llama3.2
```

This downloads the model file (~2GB) to your machine.

## 3. Run Ollama

Start the Ollama server:

```bash
ollama serve
```

It typically runs on `http://localhost:11434`.

## 4. Verify Setup

In a new terminal window, test if it's working:

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Why is UX design important?",
  "stream": false
}'
```

If you get a JSON response with text, you're ready to go!

## Troubleshooting

- **Port already in use?** Make sure no other service is using port 11434.
- **Slow response?** First run might be slower as it loads the model into RAM.
- **Memory issues?** Try a smaller model like `qwen2.5:0.5b` or `tinyllama` if your machine has limited RAM (4GB or less).

