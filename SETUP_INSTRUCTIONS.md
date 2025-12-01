# Step-by-Step Setup Instructions

Follow these exact steps to configure GitHub and Vercel for your development workflow.

## Part 1: GitHub Branch Protection (5 minutes)

### Step 1: Open Branch Protection Settings
1. Go to: **https://github.com/xplore9230/ux-skills-assessment/settings/branches**
2. You should see "Branch protection rules" section

### Step 2: Add Protection Rule for `main` Branch
1. Click **"Add rule"** button
2. In "Branch name pattern", type: `main`
3. You'll see configuration options appear below

### Step 3: Configure Protection Settings
Check the following boxes:

#### ✅ Required Settings:
- [x] **Require a pull request before merging**
  - Set "Required number of approvals" to: `1`
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from Code Owners (leave unchecked for now)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - (You can add specific status checks later if you set up CI/CD)

- [x] **Require conversation resolution before merging**
  - Ensures all PR comments are addressed

- [x] **Do not allow bypassing the above settings**
  - Prevents even admins from bypassing

- [x] **Include administrators**
  - Ensures even admins follow the rules

#### ❌ Do NOT check:
- [ ] Require linear history
- [ ] Allow force pushes
- [ ] Allow deletions

### Step 4: Save the Rule
1. Scroll down and click **"Create"** button
2. You should see a green success message
3. The rule is now active!

### Verification:
- Try creating a test PR to `main` - it should require approval
- Direct pushes to `main` should be blocked

---

## Part 2: Vercel Configuration (10 minutes)

### Step 1: Open Vercel Dashboard
1. Go to: **https://vercel.com/dashboard**
2. Log in with your account (shashankshekharnitd14@gmail.com)
3. Find and click on project: **ux-skills-assessment**

### Step 2: Configure Git Settings
1. Click **"Settings"** tab (top navigation)
2. Click **"Git"** in the left sidebar
3. You'll see Git integration settings

#### Configure Production Branch:
- Find **"Production Branch"** setting
- Set it to: `main`
- Click **"Save"** if there's a save button

#### Enable Preview Deployments:
- Find **"Preview Deployments"** section
- Ensure **"Automatic Preview Deployments"** is enabled (toggle should be ON)
- This creates preview URLs for every PR and branch

#### Add Branch Deployment for `dev`:
- Scroll to **"Branch Deployments"** section
- Click **"Add Branch"** or **"Edit"**
- Add branch name: `dev`
- This creates a permanent deployment URL for dev branch
- Click **"Save"**

### Step 3: Configure Environment Variables
1. Still in Settings, click **"Environment Variables"** in left sidebar
2. You'll see a list of environment variables (if any)

#### Add Production Variables:
1. Click **"Add New"** button
2. Fill in:
   - **Name:** `VITE_PYTHON_API_URL`
   - **Value:** Your production backend URL (e.g., `https://your-prod-backend.railway.app`)
   - **Environment:** Select **"Production"** only
3. Click **"Save"**

4. Click **"Add New"** again:
   - **Name:** `NODE_ENV`
   - **Value:** `production`
   - **Environment:** Select **"Production"** only
5. Click **"Save"**

#### Add Preview/Development Variables:
1. Click **"Add New"**:
   - **Name:** `VITE_PYTHON_API_URL`
   - **Value:** Your dev backend URL (e.g., `https://your-dev-backend.railway.app`)
   - **Environment:** Select **"Preview"** and **"Development"**
2. Click **"Save"**

3. Click **"Add New"**:
   - **Name:** `NODE_ENV`
   - **Value:** `development`
   - **Environment:** Select **"Preview"** and **"Development"**
4. Click **"Save"**

### Step 4: Verify Configuration
1. Go to **"Deployments"** tab
2. You should see deployments listed
3. Check that:
   - `main` branch deployments go to production
   - `dev` branch has its own deployment
   - Feature branches create preview deployments

---

## Part 3: Test the Workflow (5 minutes)

### Test 1: Create a Test Feature Branch
```bash
git checkout dev
git pull origin dev
git checkout -b feature/test-workflow
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: workflow setup"
git push -u origin feature/test-workflow
```

### Test 2: Create a Pull Request
1. Go to: **https://github.com/xplore9230/ux-skills-assessment/pulls**
2. Click **"New Pull Request"**
3. Select:
   - **Base:** `dev`
   - **Compare:** `feature/test-workflow`
4. Fill out PR description
5. Click **"Create Pull Request"**
6. **Check:** You should see a Vercel preview deployment URL in the PR comments!

### Test 3: Test Branch Protection
1. Try to create a PR directly to `main`:
   - Create PR: `feature/test-workflow` → `main`
   - Try to merge without approval
   - **Expected:** Merge button should be disabled or show "Review required"

2. Get approval (or approve yourself if you're the owner):
   - After approval, you should be able to merge

### Test 4: Verify Deployments
1. Go to Vercel dashboard → Deployments
2. You should see:
   - Production deployment from `main` branch
   - Dev deployment from `dev` branch
   - Preview deployment from your feature branch

---

## Quick Reference URLs

### GitHub:
- Repository: https://github.com/xplore9230/ux-skills-assessment
- Branch Settings: https://github.com/xplore9230/ux-skills-assessment/settings/branches
- Pull Requests: https://github.com/xplore9230/ux-skills-assessment/pulls
- Branches: https://github.com/xplore9230/ux-skills-assessment/branches

### Vercel:
- Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/dashboard (then select your project)
- Git Settings: https://vercel.com/dashboard (Settings → Git)
- Environment Variables: https://vercel.com/dashboard (Settings → Environment Variables)

---

## Troubleshooting

### GitHub Branch Protection Not Working
- Make sure you clicked "Create" after configuring
- Check that the rule shows `main` in the branch name pattern
- Try creating a test PR to verify

### Vercel Preview Deployments Not Showing
- Check Git integration is connected
- Verify "Automatic Preview Deployments" is enabled
- Check Vercel GitHub app has proper permissions
- Look in Vercel dashboard → Deployments to see if deployment was created

### Environment Variables Not Working
- Make sure you selected the correct environment (Production/Preview/Development)
- Redeploy after changing environment variables
- Check which environment your deployment is using

### Can't Merge PR to main
- This is expected! Branch protection is working
- You need at least 1 approval
- Request review from a team member
- After approval, merge button will be enabled

---

## Success Checklist

After completing setup, verify:

- [ ] GitHub branch protection rule exists for `main`
- [ ] Direct pushes to `main` are blocked
- [ ] PRs to `main` require approval
- [ ] Vercel production branch is set to `main`
- [ ] Vercel preview deployments are enabled
- [ ] `dev` branch is added to branch deployments
- [ ] Environment variables are set for Production and Preview
- [ ] Test PR creates a preview deployment
- [ ] Test PR to `main` requires approval

---

## Need Help?

If you encounter issues:
1. Check the detailed guides:
   - `GITHUB_BRANCH_PROTECTION.md`
   - `VERCEL_MULTI_ENV_SETUP.md`
2. Review Vercel/Railway deployment logs
3. Check GitHub Actions status (if you have CI/CD)

