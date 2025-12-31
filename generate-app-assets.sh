#!/bin/bash

# generate-app-assets.sh
# Marketing Assets Generator (Phase 1831-1840)

echo ">>> Setting up Asset Generator..."

# 1. Install Automation Dependencies
echo ">>> Installing Puppeteer & Sharp..."
npm install puppeteer sharp --save-dev

# 2. Components Created:
# - scripts/generate-assets.js (Logic)

# 3. Execution
echo ">>> Generating Assets..."
echo "NOTE: Ensure your local server is running on http://localhost:3000"
echo "If not, run 'npm run dev' in another terminal."

read -p "Is the server running? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/generate-assets.js
else
    echo ">>> Please start the server and run this script again."
fi

echo ""
echo ">>> Done! Check 'store-assets/' folder."
