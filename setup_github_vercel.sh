#!/bin/bash

# Setup script for GitHub Branch Protection and Vercel Configuration
# Run this script to automate the setup process

set -e

echo "=========================================="
echo "GitHub & Vercel Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI (gh) is not installed.${NC}"
    echo "Install it with: brew install gh"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI is not installed.${NC}"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check authentication
echo -e "${YELLOW}Checking authentication...${NC}"
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Not authenticated with GitHub.${NC}"
    echo "Run: gh auth login"
    exit 1
fi

if ! vercel whoami &> /dev/null; then
    echo -e "${RED}Not authenticated with Vercel.${NC}"
    echo "Run: vercel login"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated with both GitHub and Vercel${NC}"
echo ""

# Get repository info
REPO_OWNER="xplore9230"
REPO_NAME="ux-skills-assessment"
PROJECT_NAME="ux-skills-assessment"

echo "Repository: ${REPO_OWNER}/${REPO_NAME}"
echo ""

# GitHub Branch Protection Setup
echo "=========================================="
echo "GitHub Branch Protection Setup"
echo "=========================================="
echo ""

# Check if repository is private
IS_PRIVATE=$(gh api repos/${REPO_OWNER}/${REPO_NAME} --jq '.private')

if [ "$IS_PRIVATE" = "true" ]; then
    echo -e "${YELLOW}⚠ Repository is private.${NC}"
    echo "GitHub branch protection via API requires GitHub Pro for private repos."
    echo ""
    echo "Please set up branch protection manually:"
    echo "1. Go to: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches"
    echo "2. Click 'Add rule' for 'main' branch"
    echo "3. Configure the following:"
    echo "   ✓ Require a pull request before merging (1 approval)"
    echo "   ✓ Require status checks (optional)"
    echo "   ✓ Require branches to be up to date"
    echo "   ✓ Require conversation resolution"
    echo "   ✓ Do not allow bypassing"
    echo "   ✓ Include administrators"
    echo "   ✗ No force pushes"
    echo "   ✗ No deletions"
    echo ""
    echo "See GITHUB_BRANCH_PROTECTION.md for detailed instructions."
    echo ""
else
    echo "Setting up branch protection for 'main' branch..."
    gh api repos/${REPO_OWNER}/${REPO_NAME}/branches/main/protection -X PUT \
        -f required_status_checks='{"strict":true,"contexts":[]}' \
        -f enforce_admins=true \
        -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
        -f restrictions=null \
        -f required_linear_history=false \
        -f allow_force_pushes=false \
        -f allow_deletions=false
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Branch protection enabled for 'main' branch${NC}"
    else
        echo -e "${RED}✗ Failed to set up branch protection${NC}"
    fi
fi

echo ""

# Vercel Configuration
echo "=========================================="
echo "Vercel Configuration"
echo "=========================================="
echo ""

echo "Current Vercel project: ${PROJECT_NAME}"
echo ""

# Check if project exists
if vercel projects ls 2>&1 | grep -q "${PROJECT_NAME}"; then
    echo -e "${GREEN}✓ Project found on Vercel${NC}"
    echo ""
    
    echo "Vercel configuration needs to be done via web dashboard:"
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select project: ${PROJECT_NAME}"
    echo "3. Go to Settings → Git"
    echo "4. Configure:"
    echo "   - Production Branch: main"
    echo "   - Enable Preview Deployments"
    echo "   - Add 'dev' to Branch Deployments"
    echo ""
    echo "5. Go to Settings → Environment Variables"
    echo "   Add variables for different environments:"
    echo ""
    echo "   Production (Production only):"
    echo "   - VITE_PYTHON_API_URL=https://your-prod-backend.railway.app"
    echo "   - NODE_ENV=production"
    echo ""
    echo "   Preview (Preview deployments - includes dev and feature branches):"
    echo "   - VITE_PYTHON_API_URL=https://your-dev-backend.railway.app"
    echo "   - NODE_ENV=development"
    echo ""
    echo "See VERCEL_MULTI_ENV_SETUP.md for detailed instructions."
    echo ""
else
    echo -e "${YELLOW}⚠ Project not found.${NC}"
    echo "Please create the project first or check the project name."
fi

echo ""
echo "=========================================="
echo "Setup Summary"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Set up GitHub branch protection (see instructions above)"
echo "2. Configure Vercel settings (see instructions above)"
echo "3. Share QUICK_START_WORKFLOW.md with your team"
echo ""
echo "Documentation files created:"
echo "  - DEVELOPMENT_WORKFLOW.md"
echo "  - GITHUB_BRANCH_PROTECTION.md"
echo "  - VERCEL_MULTI_ENV_SETUP.md"
echo "  - QUICK_START_WORKFLOW.md"
echo "  - .github/PULL_REQUEST_TEMPLATE.md"
echo ""
echo -e "${GREEN}Setup script completed!${NC}"

