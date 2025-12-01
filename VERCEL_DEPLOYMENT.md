# Vercel Deployment Guide

This guide will help you deploy the UX Skills Assessment Quiz to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. The Vercel CLI installed (optional, for CLI deployment)
3. Your Python backend deployed separately (Railway, Render, or another service)

## Architecture

This application consists of two parts:

1. **Frontend + Node.js API** (deployed on Vercel)
   - React/Vite frontend
   - Express serverless functions for API routes
   - Serves static files and handles routing

2. **Python Backend** (deployed separately)
   - FastAPI server with Ollama integration
   - Handles AI-generated content (improvement plans, resources, deep dive topics)
   - Must be deployed on a service that supports Python (Railway, Render, etc.)

## Step 1: Deploy Python Backend First

Before deploying to Vercel, you need to deploy your Python backend. Here are recommended services:

### Option A: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repo
4. Add a new service and select the `server_py` directory
5. Railway will auto-detect Python and install dependencies
6. Set environment variables (see below)
7. Note the deployment URL (e.g., `https://your-app.railway.app`)

### Option B: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo
4. Set root directory to `server_py`
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Set environment variables
8. Note the deployment URL

### Python Backend Environment Variables

```bash
# Ollama Configuration (if using Ollama)
OLLAMA_HOST=http://localhost:11434  # Or your Ollama server URL

# Pre-generated mode (recommended for production)
USE_PREGENERATED=true

# CORS Origins (add your Vercel domain after deployment)
# Will be updated in step 3
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the repository

2. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of the repo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   Click "Environment Variables" and add:

   ```bash
   # Python Backend URL (from Step 1)
   VITE_PYTHON_API_URL=https://your-python-backend.railway.app
   
   # Or if using Render:
   # VITE_PYTHON_API_URL=https://your-app.onrender.com
   
   # Node Environment
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_PYTHON_API_URL
   # Enter your Python backend URL when prompted
   
   vercel env add NODE_ENV
   # Enter: production
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Update Python Backend CORS

After deploying to Vercel, update your Python backend's CORS settings to include your Vercel domain:

1. Go to `server_py/main.py`
2. Update the `allow_origins` list in the CORS middleware:

```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "https://your-app.vercel.app",  # Add your Vercel domain
    "https://*.vercel.app",  # This covers preview deployments
]
```

3. Redeploy your Python backend

## Step 4: Verify Deployment

1. **Check Frontend**
   - Visit your Vercel deployment URL
   - The app should load without errors
   - Check browser console for any API connection issues

2. **Test API Connection**
   - Open browser DevTools → Network tab
   - Complete the quiz
   - Verify that API calls to your Python backend are successful
   - Check that results page loads with AI-generated content

3. **Check Logs**
   - Vercel Dashboard → Your Project → Functions tab
   - Check for any serverless function errors
   - Python backend logs (Railway/Render dashboard)

## Troubleshooting

### Build Fails

**Error: Module not found**
- Ensure all dependencies are in `package.json`
- Try deleting `node_modules` and `package-lock.json`, then `npm install`

**Error: Build command failed**
- Check that `npm run build` works locally
- Review build logs in Vercel dashboard

### API Connection Issues

**CORS Errors**
- Verify Python backend CORS includes your Vercel domain
- Check that `VITE_PYTHON_API_URL` is set correctly

**404 on API calls**
- Verify Python backend is deployed and accessible
- Test the backend URL directly in browser
- Check that the backend is running (not sleeping on free tier)

### Static Files Not Loading

**404 on assets**
- Verify `outputDirectory` in `vercel.json` is `dist/public`
- Check that Vite build outputs to correct directory
- Ensure `vercel.json` rewrites are configured correctly

## Environment Variables Reference

### Frontend (Vercel)
- `VITE_PYTHON_API_URL` - Your Python backend URL (required)
- `NODE_ENV` - Set to `production` (optional, defaults to production on Vercel)

### Python Backend (Railway/Render)
- `OLLAMA_HOST` - Ollama server URL (optional, for AI features)
- `USE_PREGENERATED` - Use pre-generated responses (recommended: `true`)
- `PORT` - Server port (usually auto-set by hosting service)

## Custom Domain

To use a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Python backend CORS to include your custom domain

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. Preview deployments are created for pull requests.

To disable auto-deployment:
- Vercel Dashboard → Project Settings → Git
- Configure deployment settings

## Cost Considerations

### Vercel (Free Tier)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (generous limits)
- ✅ Custom domains

### Railway/Render (Free Tier)
- ⚠️ May sleep after inactivity (free tier)
- ⚠️ Limited resources
- 💡 Consider upgrading for production use

## Support

For issues:
1. Check Vercel deployment logs
2. Check Python backend logs
3. Review browser console errors
4. Verify environment variables are set correctly

## Next Steps

After successful deployment:
1. Set up a custom domain
2. Configure analytics (optional)
3. Set up monitoring/error tracking (optional)
4. Consider upgrading hosting for better performance

