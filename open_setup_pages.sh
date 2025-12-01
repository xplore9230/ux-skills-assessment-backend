#!/bin/bash

# Script to open all setup pages in your default browser
# This makes it easier to complete the setup process

echo "Opening setup pages..."
echo ""

# GitHub pages
echo "Opening GitHub branch protection settings..."
open "https://github.com/xplore9230/ux-skills-assessment/settings/branches"

sleep 2

# Vercel pages
echo "Opening Vercel dashboard..."
open "https://vercel.com/dashboard"

sleep 2

echo ""
echo "All setup pages opened in your browser!"
echo ""
echo "Follow the instructions in SETUP_INSTRUCTIONS.md"
echo "to complete the configuration."

