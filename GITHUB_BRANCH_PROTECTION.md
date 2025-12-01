# GitHub Branch Protection Setup

This guide explains how to set up branch protection rules in GitHub to enforce code review before merging to production.

## Setting Up Branch Protection for `main` Branch

### Step-by-Step Instructions

1. **Navigate to Repository Settings:**
   - Go to your GitHub repository
   - Click on **Settings** tab (top navigation)
   - Click on **Branches** in the left sidebar

2. **Add Branch Protection Rule:**
   - Click **Add rule** button
   - In "Branch name pattern", enter: `main`
   - Configure the following settings:

### Recommended Settings

#### ✅ Required Settings

**1. Require a pull request before merging**
   - ✅ Check this box
   - **Required number of approvals:** `1` (or more, based on team size)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners (if you have CODEOWNERS file)

**2. Require status checks to pass before merging**
   - ✅ Check this box
   - (Optional) Add specific status checks if you have CI/CD
   - ✅ Require branches to be up to date before merging

**3. Require conversation resolution before merging**
   - ✅ Check this box
   - Ensures all PR comments are addressed

**4. Do not allow bypassing the above settings**
   - ✅ Check this box
   - Prevents even admins from bypassing (recommended for production)

#### ⚠️ Optional Settings

**5. Require linear history**
   - ⚠️ Optional: Prevents merge commits, requires rebase
   - Recommended: Leave unchecked for flexibility

**6. Include administrators**
   - ✅ Recommended: Check this box
   - Ensures even admins follow the rules

**7. Restrict who can push to matching branches**
   - ⚠️ Optional: Can restrict to specific teams/users
   - Recommended: Leave unchecked (PR workflow handles this)

**8. Allow force pushes**
   - ❌ Leave unchecked (dangerous for production)

**9. Allow deletions**
   - ❌ Leave unchecked (protects production branch)

### Final Configuration Summary

```
Branch: main
├── ✅ Require pull request reviews (1 approval)
├── ✅ Require status checks
├── ✅ Require branches to be up to date
├── ✅ Require conversation resolution
├── ✅ Do not allow bypassing
├── ✅ Include administrators
├── ❌ No force pushes
└── ❌ No deletions
```

## Setting Up Branch Protection for `dev` Branch (Optional)

For faster development workflow, you can use lighter protection on `dev`:

1. **Add another rule** for `dev` branch
2. **Configure:**
   - ✅ Require a pull request before merging
   - ⚠️ Required approvals: `0` (optional, for faster workflow)
   - ✅ Require branches to be up to date
   - ⚠️ Do not allow bypassing: Unchecked (optional, for flexibility)
   - ❌ No force pushes
   - ❌ No deletions

This allows faster iteration on dev while still requiring PRs for visibility.

## Creating CODEOWNERS File (Optional but Recommended)

Create `.github/CODEOWNERS` file to automatically request reviews from specific team members:

```
# Default owners for entire repository
* @your-github-username @team-member-1 @team-member-2

# Frontend code
/client/ @frontend-team-member

# Backend code
/server/ @backend-team-member
/server_py/ @backend-team-member

# Critical files
package.json @tech-lead
vercel.json @tech-lead
```

This ensures the right people review the right code.

## Testing Branch Protection

1. **Try to push directly to main:**
   ```bash
   git checkout main
   git commit --allow-empty -m "test direct push"
   git push origin main
   ```
   - Should be blocked if protection is working

2. **Create a test PR:**
   - Create feature branch
   - Make a change
   - Create PR to `main`
   - Try to merge without approval
   - Should be blocked

3. **Test with approval:**
   - Get someone to approve the PR
   - Now try to merge
   - Should work

## Common Issues and Solutions

### "Branch is out of date"
- Update your branch: `git pull origin main` or use "Update branch" button in PR
- Merge the latest changes into your feature branch

### "Required status check is pending"
- Wait for CI/CD to complete
- Check Actions tab for status
- If no CI/CD, you can disable this requirement

### "Review required"
- Request review from team members
- Wait for approval
- Or adjust protection rules if needed

### Can't merge even with approval
- Check if branch is up to date
- Verify all status checks passed
- Ensure conversation is resolved (no open discussions)

## Best Practices

1. **Start Strict, Loosen if Needed:**
   - Begin with strict rules
   - Adjust based on team feedback
   - Better to be too strict than too loose

2. **Document Your Rules:**
   - Add to DEVELOPMENT_WORKFLOW.md
   - Share with team
   - Update as workflow evolves

3. **Regular Review:**
   - Review protection rules quarterly
   - Adjust based on team size and needs
   - Remove unnecessary restrictions

4. **Emergency Override:**
   - If you need to bypass (emergency only):
     - Temporarily disable protection
     - Make the change
     - Re-enable protection
     - Document why it was bypassed

## Next Steps

After setting up branch protection:
1. Test the workflow with a test PR
2. Share the workflow with your team
3. Update DEVELOPMENT_WORKFLOW.md with your specific rules
4. Set up CODEOWNERS if you want automatic reviewer assignment

