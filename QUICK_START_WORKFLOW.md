# Quick Start: Development Workflow

A quick reference guide for daily development work.

## 🚀 Starting a New Feature

```bash
# 1. Update your local dev branch
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes, commit, and push
git add .
git commit -m "feat: your feature description"
git push -u origin feature/your-feature-name
```

## 📝 Creating a Pull Request

1. Go to GitHub → Your repository
2. Click "New Pull Request"
3. Select:
   - **From:** `feature/your-feature-name`
   - **To:** `dev`
4. Fill out PR template
5. Request review from team members
6. Wait for approval and merge

## 🔄 Merging to Production

1. Create PR on GitHub:
   - **From:** `dev`
   - **To:** `main`
2. Request review (required)
3. After approval, merge
4. Production auto-deploys

## 🌐 Deployment URLs

- **Production:** Your production domain (from `main` branch)
- **Development:** `dev-your-project.vercel.app` (from `dev` branch)
- **Preview:** Auto-generated per PR (from feature branches)

## ✅ Daily Checklist

- [ ] Pull latest `dev` before starting work
- [ ] Create feature branch for each task
- [ ] Test locally before pushing
- [ ] Create PR with description
- [ ] Request review from team
- [ ] Merge to `dev` after approval
- [ ] Test on dev environment
- [ ] Merge `dev` → `main` when ready for production

## 🆘 Common Commands

```bash
# See all branches
git branch -a

# Switch branches
git checkout branch-name

# Update branch with latest changes
git pull origin dev

# See what branch you're on
git branch

# See uncommitted changes
git status

# Discard local changes (careful!)
git checkout -- file-name
```

## 📚 Full Documentation

For detailed information, see:
- `DEVELOPMENT_WORKFLOW.md` - Complete workflow guide
- `VERCEL_MULTI_ENV_SETUP.md` - Vercel configuration
- `GITHUB_BRANCH_PROTECTION.md` - Branch protection setup

