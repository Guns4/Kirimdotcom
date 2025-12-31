#!/bin/bash

# setup-tier-pricing.sh
# Wholesale Pricing System (Phase 1751-1755)

echo ">>> Setting up Wholesale Pricing..."

# Components Created:
# 1. supabase/migrations/20251231_tier_pricing.sql
# 2. src/lib/tier-pricing.ts
# 3. src/components/pricing/TierUpgrade.tsx
# 4. src/app/dashboard/upgrade/page.tsx

mkdir -p src/lib
mkdir -p src/components/pricing
mkdir -p src/app/dashboard/upgrade
mkdir -p supabase/migrations

echo ">>> Account Levels:"
echo "  1. BASIC (Default)"
echo "     - Base Price + Rp 1.000"
echo ""
echo "  2. RESELLER (Via Upgrade)"
echo "     - Base Price + Rp 200"
echo "     - Biaya Upgrade: Rp 100.000 (Sekali bayar)"
echo ""
echo "  3. VIP (Premium)"
echo "     - Base Price + Rp 50"
echo "     - Biaya Upgrade: Rp 500.000 (Sekali bayar)"

echo ""
echo ">>> Pricing Logic:"
echo "  Price = Base Price + Markup(Tier)"
echo "  All backend calculations automatically adjust based on user tier."

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Upgrade Page: /dashboard/upgrade"
