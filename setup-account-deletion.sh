#!/bin/bash

# setup-account-deletion.sh
# App Store Compliance - Account Deletion (Phase 1901-1905)

echo ">>> Setting up Account Deletion Feature..."

# 1. Database Migration
echo ">>> Components Created:"
echo "  - Authorization: supabase/migrations/20251231_account_deletion.sql"
echo "    (Adds 'deleted_at' & 'soft_delete_user' function)"

# 2. Logic
echo "  - API: src/app/api/user/delete/route.ts"
echo "  - UI: src/components/settings/DeleteAccountZone.tsx"

echo ""
echo ">>> Integration Instructions:"
echo "1. Run the migration in Supabase SQL Editor."
echo "2. Add <DeleteAccountZone userId={user.id} /> to your Settings Page."
echo "3. Ensure SERVICE_ROLE_KEY is set in .env for Storage Deletion."

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
