# Vercel Multi-Environment Setup Guide

This guide explains how to configure Vercel for separate development and production environments.

## Option 1: Single Project with Branch-Based Deployments (Recommended)

This is the simplest approach and works well for most teams.

### Setup Steps

1. **Go to Vercel Dashboard** → Your Project → Settings → Git

2. **Configure Production Branch:**
   - Set **Production Branch** to `main`
   - This ensures only `main` branch deploys to production

3. **Enable Preview Deployments:**
   - Go to Settings → Git → **Preview Deployments**
   - Enable "Automatic Preview Deployments"
   - All branches and PRs will get preview URLs automatically

4. **Configure Branch Deployments:**
   - Go to Settings → Git → **Branch Deployments**
   - Add `dev` branch
   - This creates a permanent deployment URL for the `dev` branch
   - URL format: `dev-your-project.vercel.app`

### Environment Variables

Set environment variables per environment:

1. **Go to Settings → Environment Variables**

2. **Add variables with different values per environment:**

   **Production (Production branch only):**
   ```
   VITE_PYTHON_API_URL=https://your-prod-backend.railway.app
   NODE_ENV=production
   ```

   **Preview (Preview deployments - includes dev and feature branches):**
   ```
   VITE_PYTHON_API_URL=https://your-dev-backend.railway.app
   NODE_ENV=development
   ```

   **Development (Specific to dev branch):**
   ```
   VITE_PYTHON_API_URL=https://your-dev-backend.railway.app
   NODE_ENV=development
   ```

3. **Priority Order:**
   - Production variables apply to `main` branch
   - Preview/Development variables apply to `dev` and feature branches
   - You can override per branch if needed

## Option 2: Separate Projects (Advanced)

If you need completely separate projects with different domains:

### Setup Steps

1. **Create Production Project:**
   - Connect to your GitHub repo
   - Set production branch to `main`
   - Use production domain (e.g., `uxlevel.online`)

2. **Create Development Project:**
   - Create a new project in Vercel
   - Connect to the same GitHub repo
   - Set production branch to `dev`
   - Use dev domain (e.g., `dev-uxlevel.vercel.app`)

3. **Configure Environment Variables:**
   - Set production variables in production project
   - Set dev variables in dev project
   - Each project manages its own variables independently

### Pros and Cons

**Option 1 (Branch-Based):**
- ✅ Simpler setup
- ✅ Single project to manage
- ✅ Automatic preview deployments
- ⚠️ Shared project settings
- ⚠️ Environment variables need careful configuration

**Option 2 (Separate Projects):**
- ✅ Complete separation
- ✅ Independent settings per environment
- ✅ Different domains/subdomains
- ⚠️ More complex setup
- ⚠️ Need to manage two projects

## Recommended Configuration

For your team size (2-3 developers), **Option 1 (Branch-Based)** is recommended.

### Configuration Summary

```
Production (main branch):
├── URL: your-production-domain.com
├── Environment: Production
└── Backend: Production Railway instance

Development (dev branch):
├── URL: dev-your-project.vercel.app
├── Environment: Development
└── Backend: Dev Railway instance (or same with dev env vars)

Preview (feature branches):
├── URL: feature-name-abc123.vercel.app (auto-generated)
├── Environment: Preview
└── Backend: Dev Railway instance
```

## Verifying Setup

1. **Test Production:**
   - Push to `main` branch
   - Check production URL updates

2. **Test Development:**
   - Push to `dev` branch
   - Check dev URL updates (or preview URL)

3. **Test Preview:**
   - Create feature branch
   - Push and create PR
   - Check preview URL in PR comments

## Troubleshooting

### Dev Branch Not Deploying
- Check Settings → Git → Branch Deployments
- Ensure `dev` branch is added
- Verify branch exists in GitHub

### Wrong Environment Variables
- Check variable scope (Production/Preview/Development)
- Verify which environment the deployment is using
- Redeploy after changing variables

### Preview URLs Not Showing in PRs
- Check GitHub integration in Vercel
- Verify Vercel GitHub app has proper permissions
- Check Vercel project settings

## Next Steps

After setting up Vercel:
1. Configure Railway backend for dev environment (if needed)
2. Update CORS settings in backend to include dev URLs
3. Test the full workflow: feature → dev → main
4. Document your specific URLs for the team

