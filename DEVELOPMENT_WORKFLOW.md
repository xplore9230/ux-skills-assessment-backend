# Development Workflow Guide

This document outlines the Git workflow and deployment strategy for the UX Skills Assessment project.

## Branch Strategy

### Branch Types

1. **`main`** - Production branch
   - Protected branch (requires PR approval)
   - Auto-deploys to production environment
   - Only merge from `dev` branch via Pull Request

2. **`dev`** - Development/Staging branch
   - Development environment
   - Auto-deploys to dev/staging URLs
   - Merge feature branches here for testing

3. **`feature/*`** - Feature branches
   - Individual feature development
   - Auto-creates preview deployments on Vercel
   - Merge to `dev` for testing, then to `main` for production

## Workflow Process

### Starting a New Feature

```bash
# 1. Make sure you're on the latest dev branch
git checkout dev
git pull origin dev

# 2. Create a new feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git add .
git commit -m "feat: description of your feature"

# 4. Push to remote (creates preview deployment)
git push -u origin feature/your-feature-name
```

### Feature Branch → Development

```bash
# 1. Push your feature branch
git push origin feature/your-feature-name

# 2. Create Pull Request on GitHub
#    From: feature/your-feature-name
#    To: dev

# 3. Request review from team members
# 4. After approval, merge PR to dev
# 5. Vercel will auto-deploy to dev environment
```

### Development → Production

```bash
# 1. Ensure dev branch is stable and tested
git checkout dev
git pull origin dev

# 2. Create Pull Request on GitHub
#    From: dev
#    To: main

# 3. Request review (required for main branch)
# 4. After approval, merge PR to main
# 5. Vercel will auto-deploy to production
```

## Deployment Environments

### Production (`main` branch)
- **Frontend**: Auto-deploys to production Vercel project
- **Backend**: Railway production environment
- **URL**: Your production domain (e.g., `uxlevel.online`)

### Development (`dev` branch)
- **Frontend**: Auto-deploys to dev Vercel project/preview
- **Backend**: Railway dev environment (if configured)
- **URL**: Dev/staging URL (configured in Vercel)

### Preview (feature branches)
- **Frontend**: Auto-creates preview deployment for each PR
- **Backend**: Uses dev backend (or can point to dev API)
- **URL**: Auto-generated preview URL (e.g., `feature-name-abc123.vercel.app`)

## Vercel Configuration

### Setting Up Branch-Based Deployments

1. **Go to Vercel Dashboard** → Your Project → Settings → Git
2. **Configure Production Branch**: Set to `main`
3. **Configure Preview Deployments**: Enable for all branches
4. **Create Separate Dev Project** (Optional):
   - Create a new Vercel project
   - Connect to same GitHub repo
   - Set production branch to `dev`
   - Use different environment variables for dev

### Environment Variables

Set different environment variables per environment:

**Production (main branch):**
- `VITE_PYTHON_API_URL=https://your-prod-backend.railway.app`
- `NODE_ENV=production`

**Development (dev branch):**
- `VITE_PYTHON_API_URL=https://your-dev-backend.railway.app`
- `NODE_ENV=development`

**Preview (feature branches):**
- Uses dev environment variables by default
- Can be overridden per branch if needed

## Railway Backend Configuration

### Setting Up Dev Environment

1. **Create Dev Service** in Railway:
   - Duplicate your production service
   - Name it "ux-skills-assessment-dev"
   - Use same codebase but different environment variables

2. **Environment Variables for Dev:**
   - `USE_PREGENERATED=true`
   - `OLLAMA_HOST=http://localhost:11434` (or dev Ollama instance)
   - Different CORS origins (include dev Vercel URLs)

3. **Update CORS in `server_py/main.py`:**
```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-dev-app.vercel.app",  # Dev frontend
    "https://your-prod-app.vercel.app",  # Prod frontend
    "https://*.vercel.app",  # Preview deployments
]
```

## Branch Protection Rules

### Setting Up in GitHub

1. Go to **Repository Settings** → **Branches**
2. Click **Add rule** for `main` branch
3. Configure:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1 (or more)
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict pushes that create files larger than 100 MB

4. (Optional) Add rule for `dev` branch:
   - ✅ Require a pull request before merging
   - ⚠️ Require approvals: 0 (optional, for faster dev workflow)

## Best Practices

### Commit Messages
Use conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Refactoring
- `docs/description` - Documentation

### Code Review Guidelines
- Review PRs within 24 hours if possible
- Test the preview deployment before approving
- Check for:
  - Code quality and style
  - Potential bugs
  - Performance implications
  - Security concerns
  - Test coverage

### Merging Strategy
- **Squash and merge** recommended for feature branches
- **Merge commit** for dev → main (preserves history)
- Always delete feature branch after merging

## Troubleshooting

### Preview Deployment Not Working
- Check Vercel project settings
- Verify branch is pushed to GitHub
- Check build logs in Vercel dashboard

### Environment Variables Not Updating
- Vercel caches environment variables
- Redeploy after changing env vars
- Check which environment the variable is set for (Production/Preview/Development)

### Merge Conflicts
```bash
# Update your feature branch with latest dev
git checkout feature/your-branch
git fetch origin
git merge origin/dev
# Resolve conflicts, then push
git push origin feature/your-branch
```

## Quick Reference

```bash
# Start new feature
git checkout dev && git pull
git checkout -b feature/my-feature

# Work on feature
git add . && git commit -m "feat: my changes"
git push origin feature/my-feature

# Merge to dev (via GitHub PR)
# Then merge dev to main (via GitHub PR)
```

## Team Workflow Example

**Developer A** working on "New Quiz Page":
1. Creates `feature/new-quiz-page`
2. Develops and pushes
3. Creates PR: `feature/new-quiz-page` → `dev`
4. Gets preview URL automatically
5. Team reviews, approves, merges to `dev`
6. Tests on dev environment
7. Creates PR: `dev` → `main`
8. After approval, merges to `main` → Production

**Developer B** working on "Results Page Update":
1. Creates `feature/results-update` (parallel to Developer A)
2. No conflicts, works independently
3. Same process: feature → dev → main

Both developers can work simultaneously without conflicts!

## Support

For questions or issues with the workflow:
1. Check this documentation
2. Review Vercel/Railway deployment logs
3. Ask team members
4. Check GitHub Actions/CI status

