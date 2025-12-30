#!/bin/bash

# setup-agent-registration.sh
# O2O Expansion Setup

echo ">>> Setting up Agent Registration..."

# Components Created:
# 1. supabase/migrations/20251231_agent_registration.sql
# 2. src/lib/agent-service.ts
# 3. src/components/agent/AgentRegistrationForm.tsx
# 4. src/app/agent-registration/page.tsx

if [ -f "supabase/migrations/20251231_agent_registration.sql" ]; then
    echo ">>> DB Migration File Ready: supabase/migrations/20251231_agent_registration.sql"
fi

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
echo "Agent Registration Live at: http://localhost:3000/agent-registration"
