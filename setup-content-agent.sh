#!/bin/bash

# setup-content-agent.sh
# Content Agent / Organic Traffic Machine (Phase 1851-1860)

echo ">>> Setting up Content Agent AI..."

# 1. Install Dependencies
echo ">>> Installing AI & Trends Libraries..."
npm install google-trends-api openai slugify dotenv --save

# 2. Components Created:
# - scripts/content-agent.js (Logic)

echo ">>> Configuration:"
echo "Ensure you have the following in .env.local:"
echo "  OPENAI_API_KEY=sk-..."
echo "  NEXT_PUBLIC_SUPABASE_URL=..."
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=..."

# 3. Execution
echo ">>> Running Content Agent (Test Run)..."
echo "NOTE: This will consume OpenAI credits."

read -p "Do you want to generate an article now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/content-agent.js
else
    echo ">>> Skipped generation. Run 'node scripts/content-agent.js' later."
fi

echo ""
echo ">>> Setup Complete!"
