#!/bin/bash

# Test Before Check Script
# Runs comprehensive test suite before asking user to review changes

set -e  # Exit on error

echo "🧪 Running comprehensive test suite..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Check if Playwright browsers are installed
if [ ! -d "node_modules/@playwright" ] || [ ! -f "node_modules/.cache/playwright" ]; then
    echo -e "${YELLOW}⚠️  Playwright browsers not installed. Installing...${NC}"
    npx playwright install --with-deps
fi

# Run tests
echo -e "${GREEN}▶️  Running all E2E tests...${NC}"
npm run test:all

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Test results available in:"
    echo "  - playwright-report/ (HTML report)"
    echo "  - playwright-html-report/ (Enhanced HTML report)"
    exit 0
else
    echo -e "${RED}❌ Tests failed!${NC}"
    echo ""
    echo "Please review the test failures above."
    echo "Test reports available in:"
    echo "  - playwright-report/ (HTML report)"
    echo "  - playwright-html-report/ (Enhanced HTML report)"
    exit $TEST_EXIT_CODE
fi

