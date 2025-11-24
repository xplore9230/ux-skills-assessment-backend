# UX Skills Assessment - Backend API

Python FastAPI backend for the UX Skills Assessment application.

## Features

- FastAPI REST API
- Ollama LLM integration for AI-powered responses
- ChromaDB vector store for RAG (Retrieval Augmented Generation)
- Pre-generated response caching
- Curated resources management

## Tech Stack

- Python 3.11
- FastAPI
- Ollama (llama3.2 model)
- ChromaDB
- Sentence Transformers

## Deployment

This backend is deployed on Railway.

### Railway Configuration

- **Builder**: Dockerfile
- **Health Check**: `/health`
- **Start Command**: `/code/entrypoint.sh`

### Environment Variables

- `PORT`: Server port (default: 8000)
- `OLLAMA_HOST`: Ollama service URL (default: http://localhost:11434)
- `USE_PREGENERATED`: Enable pre-generated responses (default: true)

## Local Development

1. Install dependencies:
```bash
pip install -r server_py/requirements.txt
```

2. Start Ollama:
```bash
ollama serve
ollama pull llama3.2
```

3. Run the server:
```bash
cd server_py
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/generate-improvement-plan` - Generate 4-week improvement plan
- `POST /api/generate-resources` - Get curated resources
- `POST /api/generate-deep-dive` - Generate deep dive topics
- `POST /api/generate-layout` - Generate layout strategy
- `POST /api/generate-category-insights` - Generate category insights
- `GET /api/job-search-links` - Get job search links

## Repository Structure

```
.
├── server_py/          # Python backend code
│   ├── main.py         # FastAPI application
│   ├── ollama_client.py # Ollama integration
│   ├── rag.py          # RAG system
│   ├── resources.json  # Curated resources
│   └── ...
├── Dockerfile          # Docker configuration
├── railway.json        # Railway configuration
└── railway.toml        # Railway configuration (alternative)

```

## Related Repositories

- **Frontend**: [ux-skills-assessment](https://github.com/xplore9230/ux-skills-assessment) (main repository)

