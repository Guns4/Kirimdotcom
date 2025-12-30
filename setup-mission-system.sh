#!/bin/bash

# setup-mission-system.sh
# DAU Improvement - Daily Mission System

echo ">>> Setting up Daily Mission System..."

# Components Created:
# 1. supabase/migrations/20251231_daily_missions.sql
# 2. src/lib/mission-engine.ts
# 3. src/components/gamification/DailyMissionsWidget.tsx
# 4. src/app/dashboard/missions/page.tsx

echo ">>> Mission System Features:"
echo "  - Daily missions reset at 00:00"
echo "  - 4 missions per day (1 Easy, 2 Medium, 1 Hard)"
echo "  - Auto-tracking via event listeners"
echo "  - Auto-claim rewards on completion"

echo ""
echo ">>> Mission Types:"
echo "  🔑 LOGIN      - Login hari ini (+5 XP)"
echo "  📦 CEK_RESI   - Tracking resi (+20-50 XP)"
echo "  💰 TOPUP      - Topup saldo (+50-100 XP)"
echo "  📤 SHARE      - Share ke WA (+30-80 XP)"
echo "  🎯 OPTIMIZE   - Route optimizer (+40 XP)"
echo "  👥 REFERRAL   - Ajak teman (+200 XP)"
echo "  🏷️ BULK_LABEL - Generate labels (+30 XP)"

echo ""
echo ">>> Integration:"
echo "  Call trackMissionEvent('EVENT_TYPE') after user actions"
echo "  Example: trackMissionEvent('CEK_RESI')"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Missions Page: http://localhost:3000/dashboard/missions"
echo ""
echo ">>> Next Steps:"
echo "1. Run migration in Supabase"
echo "2. Add DailyMissionsWidget to main dashboard"
echo "3. Hook trackMissionEvent() to user actions"
