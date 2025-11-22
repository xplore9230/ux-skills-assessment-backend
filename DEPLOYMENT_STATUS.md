# Deployment readiness (Railway)

The repository is configured to deploy the Python FastAPI service on Railway using Nixpacks:

- **Builder**: Railway uses Nixpacks with the root-level `nixpacks.toml`, pinning Python 3.11 and installing `server_py/requirements.txt`.
- **Start command**: Both Railway and Nixpacks run `uvicorn main:app` from `server_py`, binding to `0.0.0.0` on the platform-provided port.
- **Health check**: The deployed service should respond on `/health`, which is implemented in `server_py/main.py`.

## What to verify before deploying
- Ensure the `OLLAMA_HOST` environment variable points to a reachable Ollama endpoint; otherwise the app will fall back to simple responses.
- If you plan to use the RAG features, confirm that required vector store dependencies are available (installed via `requirements.txt`) and that any necessary data initialization has run.

With those checks, the current configuration is ready to deploy on Railway.
