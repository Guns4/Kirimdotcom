#!/bin/bash

# setup-link-checker.sh
# SEO Hygiene Automation

echo ">>> Setting up Link Checker..."

# Ensure deps
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ">>> Ready to crawl!"
echo "Usage: node scripts/link-checker.js <TARGET_URL>"
echo "Example: node scripts/link-checker.js http://localhost:3000"
echo ""
echo "Note: Ensure your local server is running in another terminal!"

# Make it executable (optional in windows but good practice)
# chmod +x scripts/link-checker.js
