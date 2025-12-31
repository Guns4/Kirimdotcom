#!/bin/bash

# setup-agent-finder.sh
# Logistics Agent Locator & Crowdsourcing

echo ">>> Setting up Agent Finder..."

mkdir -p src/components/maps
mkdir -p src/app/actions
mkdir -p src/app/area/[...slug]

echo "✅ Schema: supabase/migrations/agent_finder_schema.sql"
echo "✅ Server Action: src/app/actions/agent-locator.ts"
echo "✅ Map Component: src/components/maps/AgentMap.tsx"
echo "✅ Form Component: src/components/maps/AddAgentForm.tsx"
echo "✅ Page Integration: src/app/area/[...slug]/page.tsx"

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
echo "Agent Locator Live. Check: http://localhost:3000/area/..."
