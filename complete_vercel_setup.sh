#!/bin/bash

# Complete Vercel Setup Script
# This script helps configure Vercel via web interface

set -e

echo "=========================================="
echo "Vercel Configuration Helper"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_NAME="ux-skills-assessment"

echo -e "${BLUE}Opening Vercel dashboard...${NC}"
open "https://vercel.com/dashboard"

sleep 2

echo ""
echo -e "${YELLOW}Follow these steps in the Vercel dashboard:${NC}"
echo ""
echo "1. Select project: ${PROJECT_NAME}"
echo "2. Go to Settings → Git"
echo "3. Configure:"
echo "   - Production Branch: main"
echo "   - Enable Preview Deployments"
echo "   - Add 'dev' to Branch Deployments"
echo ""
echo "4. Go to Settings → Environment Variables"
echo "   Add the following:"
echo ""
echo "   For PRODUCTION environment:"
echo "   - Name: VITE_PYTHON_API_URL"
echo "   - Value: (your production backend URL)"
echo "   - Name: NODE_ENV"
echo "   - Value: production"
echo ""
echo "   For PREVIEW and DEVELOPMENT environments:"
echo "   - Name: VITE_PYTHON_API_URL"
echo "   - Value: (your dev backend URL or leave empty for same-origin)"
echo "   - Name: NODE_ENV"
echo "   - Value: development"
echo ""
echo -e "${GREEN}Configuration guide opened in browser!${NC}"

