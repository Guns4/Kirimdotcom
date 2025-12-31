#!/bin/bash

# setup-social-poster.sh
# Social Proof / Auto Poster (Phase 1876-1900)

echo ">>> Setting up Social Poster Bot..."

# 1. Install Dependencies
echo ">>> Installing Twitter API & Sharp..."
npm install twitter-api-v2 sharp dotenv --save

# 2. Components Created:
# - scripts/social-poster.js (Logic)

echo ">>> Configuration:"
echo "To enable Real Posting, add TWITTER_* keys to .env.local."
echo "Otherwise, it runs in SIMULATION mode (Logs only)."

# 3. Execution
echo ">>> Running Social Poster (Test Run)..."

read -p "Do you want to generate a poster now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/social-poster.js
else
    echo ">>> Skipped. Run 'node scripts/social-poster.js' later."
fi

echo ""
echo ">>> Setup Complete!"
