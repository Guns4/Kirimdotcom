#!/bin/bash

# setup-tycoon-game.sh
# Retention Gamification - Logistics Tycoon

echo ">>> Setting up Logistics Tycoon Game..."

# Components Created:
# 1. supabase/migrations/20251231_tycoon_game.sql
# 2. src/lib/tycoon-engine.ts
# 3. src/components/gamification/TycoonDashboard.tsx
# 4. src/app/dashboard/tycoon/page.tsx

echo ">>> Level System:"
echo "  Level 1-2:  🏠 Garasi Rumah (User Baru)"
echo "  Level 3-4:  🏪 Toko Kecil"
echo "  Level 5-6:  🏭 Gudang Sedang"
echo "  Level 7-8:  🏢 Gudang Besar"
echo "  Level 9-10: 🏗️ Gudang Raksasa (Sultan)"

echo ""
echo ">>> Unlockables:"
echo "  Truck Skins: Default, Blue, Gold, Diamond, Legendary"
echo "  Discounts: 5% (Lv3), 10% (Lv6), 15% (Lv9), FREE (Lv10)"

echo ""
echo ">>> XP Rewards:"
echo "  Shipment: +10 XP"
echo "  Route Optimization: +50 XP"
echo "  Referral: +200 XP"
echo "  Daily Login: +5 XP"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Tycoon Dashboard: http://localhost:3000/dashboard/tycoon"
echo ""
echo ">>> Integration Tips:"
echo "1. Call awardXP() after user actions"
echo "2. Show TycoonDashboard widget in main dashboard"
echo "3. Apply admin_fee_discount to transactions"
