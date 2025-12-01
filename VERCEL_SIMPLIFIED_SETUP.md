# Vercel Simplified Setup Guide

## Good News! 🎉

Vercel **automatically** handles most of what you need:

1. ✅ **Production Branch** - Automatically set to your GitHub default branch (`main`)
2. ✅ **Preview Deployments** - Automatically enabled for all Pull Requests
3. ✅ **Branch Deployments** - Preview deployments work for any branch/PR

## What You Actually Need to Configure

### Step 1: Environment Variables (Most Important!)

1. In your project settings, click **"Environment Variables"** in the left sidebar
2. Add your environment variables:

#### For Production:
- Click **"Add New"**
- **Name:** `VITE_PYTHON_API_URL`
- **Value:** Your production backend URL
- **Environment:** Check only **"Production"**
- Click **"Save"**

- Click **"Add New"** again
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Check only **"Production"**
- Click **"Save"**

#### For Preview/Development:
- Click **"Add New"**
- **Name:** `VITE_PYTHON_API_URL`
- **Value:** Your dev backend URL (or leave empty)
- **Environment:** Check **"Preview"** and **"Development"**
- Click **"Save"**

- Click **"Add New"** again
- **Name:** `NODE_ENV`
- **Value:** `development`
- **Environment:** Check **"Preview"** and **"Development"**
- Click **"Save"**

### Step 2: Verify Automatic Settings (Optional)

1. Go to **"Build and Deployment"** in left sidebar
2. Check **"Production Branch"** - should show `main` (automatic)
3. Preview deployments should be working automatically

## How It Works

- **Main branch** → Automatically deploys to production
- **Any PR** → Automatically creates preview deployment
- **Dev branch** → Will create preview deployment when you push or create PR

## Test It!

1. Create a feature branch:
   ```bash
   git checkout -b feature/test
   git push -u origin feature/test
   ```

2. Create a PR on GitHub
3. Check the PR - Vercel should automatically comment with a preview URL!

## That's It! 🎉

You don't need to manually configure:
- Production Branch (automatic)
- Preview Deployments (automatic)
- Branch Deployments (automatic via previews)

Just configure **Environment Variables** and you're done!

