# Railway Setup Instructions - Backend Repository

## Connecting Railway to New Backend Repository

Follow these steps to connect Railway to the new backend repository:

### Step 1: Disconnect Current Repository

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on the backend service
4. Go to **Settings** tab
5. Scroll to **GitHub** section
6. Click **Disconnect** to unlink the current repository

### Step 2: Connect New Backend Repository

1. In the same **Settings** tab
2. Under **GitHub** section, click **Connect Repository**
3. Select the repository: `xplore9230/ux-skills-assessment-backend`
4. Select the branch: `main`
5. Railway will automatically detect the Dockerfile and configure the service

### Step 3: Verify Configuration

1. Go to **Settings** → **Build & Deploy**
2. Verify:
   - **Builder**: DOCKERFILE
   - **Dockerfile Path**: `Dockerfile`
   - **Start Command**: `/code/entrypoint.sh`
   - **Health Check Path**: `/health`

### Step 4: Test Deployment

1. Make a small change to the backend repository
2. Push to GitHub
3. Verify Railway deploys automatically
4. Test that frontend changes in main repo don't trigger Railway

### Step 5: Update Environment Variables

Ensure all environment variables are set in Railway:
- `PORT` (auto-set by Railway)
- `OLLAMA_HOST` (if needed)
- `USE_PREGENERATED` (optional)

## Verification

After setup:
- ✅ Frontend changes in main repo don't trigger Railway
- ✅ Backend changes in `ux-skills-assessment-backend` trigger Railway
- ✅ Backend deploys successfully
- ✅ Health check passes

