# Backend Repository

The Python backend API has been moved to a separate repository for better separation of concerns and independent deployment.

## Backend Repository

**GitHub**: https://github.com/xplore9230/ux-skills-assessment-backend

## Why Separate?

- **Independent Deployments**: Frontend changes don't trigger Railway backend deployments
- **Clean Separation**: Backend and frontend can evolve independently
- **Better Organization**: Clearer codebase structure
- **Faster Deployments**: Only deploy what changed

## Railway Configuration

The backend is deployed on Railway and connected to the separate repository:
- **Repository**: `ux-skills-assessment-backend`
- **Service**: Railway watches only backend repository
- **Auto-deploy**: Enabled for backend repository only

## Local Development

For local development, the backend code is still available in `server_py/` directory, but deployments use the separate repository.

## Updating Backend

To update the backend:
1. Make changes in the backend repository: `ux-skills-assessment-backend`
2. Push to GitHub
3. Railway automatically deploys

## Frontend-Backend Communication

The frontend connects to the backend via the `VITE_PYTHON_API_URL` environment variable:
- **Production**: Set to Railway backend URL
- **Local**: Defaults to `http://localhost:8000`

