#!/bin/bash

# setup-agent-finder.sh
# Logistics Agent Locator & Crowdsourcing

echo ">>> Setting up Agent Finder..."

# Files already created:
# 1. src/app/actions/agent-locator.ts (Server Action)
# 2. src/components/maps/AddAgentForm.tsx (Submission Form)
# 3. src/components/maps/AgentMap.tsx (Leaflet Map)
# 4. Integrated into src/app/area/[...slug]/page.tsx

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
echo "Agent Locator Live. Check: http://localhost:3000/area/..."
