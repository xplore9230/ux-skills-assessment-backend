# Deployment readiness (Railway)

The backend deploys to Railway via the root Dockerfile so the full AI stack (Ollama + Llama) ships with the service:

- **Builder**: Railway uses the root `Dockerfile` to install Ollama inside the container. The image preloads the `llama3.2` model during build, then the entrypoint starts `ollama serve`, verifies the model, and launches FastAPI.
- **Start / port binding**: The entrypoint runs `uvicorn main:app` from `server_py`, binding to `0.0.0.0` on the platform-provided `$PORT` (default 8000 locally). The Railway `startCommand` is pinned to the entrypoint so the platform does not try to execute shell snippets like `cd` directly.
- **Health check**: `/health` from `server_py/main.py` is exposed for Railway health monitoring.
- **Pregenerated data**: The deployment includes pregenerated responses for all scores (0-100) for instant AI responses without requiring live model inference.

## Enabling Docker builds on Railway (so Ollama installs correctly)

1. In the Railway dashboard, open the service settings and make sure **Builder** is set to **Dockerfile** (this reads the root `Dockerfile` and installs Ollama inside the image).
2. If a Nixpacks plan is auto-detected, override it by pointing Railway at this repository and explicitly selecting Dockerfile mode so the install script can run with `apt`.
3. Trigger a deploy and confirm the build logs show Docker build steps (e.g., `COPY server_py/`, `curl -fsSL https://ollama.com/install.sh | sh`).
4. After the container boots, check logs for `Ollama is ready` followed by `Starting FastAPI application...` to verify both the model preload and backend startup.

## What to verify before deploying
- Railway instances need enough memory/CPU for Ollama and the Llama model. Use a plan that can handle `ollama serve` + `llama3.2` (consider smaller models if resources are tight).
- Because `llama3.2` is baked into the image, ensure the image size is acceptable for your plan and registry limits. If a lighter footprint is required, switch to a smaller model or pull at runtime.
- If you plan to use the RAG features, confirm that required vector store dependencies are available (installed via `requirements.txt`) and that any necessary data initialization has run.
- The pregenerated data provides instant responses, but for real-time AI generation, ensure the Ollama service is running and accessible.
