#!/bin/bash

# setup-downline-system.sh
# Passive Network - Downline & Commission System (Phase 1761-1765)

echo ">>> Setting up Downline System..."

# Components Created:
# 1. supabase/migrations/20251231_downline_system.sql
# 2. src/lib/downline-service.ts
# 3. src/components/network/DownlineDashboard.tsx
# 4. src/app/dashboard/network/page.tsx

echo ">>> System Rules:"
echo "  1. Relation: One Upline -> Many Downlines"
echo "  2. Trigger: Transaction SUCCESS"
echo "  3. Reward: Rp 25 to Upline Wallet"
echo "  4. Ledger Type: COMMISSION_REWARD"

echo ""
echo ">>> Usage:"
echo "  - User shares Referral Link"
echo "  - New User registers via link -> Relation created"
echo "  - Downline transacts -> Upline gets commission"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Dashboard: /dashboard/network"
