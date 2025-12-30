#!/bin/bash

# setup-dead-mans-switch.sh
# Business Continuity Setup

echo ">>> Setting up Dead Man's Switch..."

# Components Created:
# 1. supabase/migrations/20251231_dead_mans_switch.sql
# 2. src/lib/dead-mans-switch.ts
# 3. src/components/admin/HeartbeatButton.tsx
# 4. src/app/api/cron/dead-mans-switch/route.ts
# 5. src/app/actions/dms-action.ts

if [ -f "supabase/migrations/20251231_dead_mans_switch.sql" ]; then
    echo ">>> DB Migration File Ready: supabase/migrations/20251231_dead_mans_switch.sql"
fi

echo ">>> Instructions:"
echo "1. Run the SQL in Supabase."
echo "2. Add <HeartbeatButton /> to your Admin Dashboard."
echo "3. Schedule GET /api/cron/dead-mans-switch daily."

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
