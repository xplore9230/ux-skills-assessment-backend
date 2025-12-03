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

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key (starts with `sk-proj-...`) - **CRITICAL for AI features**
- `PORT` (auto-set by Railway)

**Optional:**
- `OLLAMA_HOST` (if using Ollama for local AI)
- `USE_PREGENERATED` (set to `true` for faster responses)
- `PYTHON_API_URL` or `RAG_API_URL` (if Node.js needs to call Python backend)

**How to Add Variables:**
1. Go to Railway Dashboard → Your Service → **Variables** tab
2. Click **+ New Variable**
3. Add `OPENAI_API_KEY` with your API key value
4. Railway will auto-redeploy with the new variable

**To Check if OPENAI_API_KEY is Set:**
1. Railway Dashboard → Your Service → **Variables** tab
2. Look for `OPENAI_API_KEY` in the list
3. If missing, add it using the steps above

## Verification

After setup:
- ✅ Frontend changes in main repo don't trigger Railway
- ✅ Backend changes in `ux-skills-assessment-backend` trigger Railway
- ✅ Backend deploys successfully
- ✅ Health check passes

