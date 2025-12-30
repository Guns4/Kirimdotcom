#!/bin/bash

# setup-panic-button.sh
# Emergency Control Setup

echo ">>> Setting up Panic Button..."

# Components Created:
# 1. supabase/migrations/20251231_system_lockdown.sql
# 2. src/lib/lockdown.ts
# 3. src/middleware.ts (Updated)
# 4. src/components/admin/PanicButton.tsx
# 5. src/app/actions/lockdown-action.ts

if [ -f "supabase/migrations/20251231_system_lockdown.sql" ]; then
    echo ">>> DB Migration File Ready: supabase/migrations/20251231_system_lockdown.sql"
fi

echo ">>> Instructions:"
echo "1. Run SQL in Supabase."
echo "2. Place <PanicButton /> in your Admin Dashboard Header."
echo "3. (Optional) Wrap critical Server Actions with isSystemLocked()."

echo ">>> Running Typecheck..."
npm run typecheck

echo ">>> Setup Complete!"
