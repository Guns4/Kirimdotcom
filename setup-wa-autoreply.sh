#!/bin/bash

# setup-wa-autoreply.sh
# Bot Automation - Smart Resi Detection & Auto-Reply

echo ">>> Setting up WA Auto-Reply Bot..."

# Components Created:
# 1. src/lib/wa-autoreply.ts
# 2. supabase/migrations/20251231_wa_subscriptions.sql
# 3. src/components/wa/WAAutoReplySettings.tsx

echo ">>> Features:"
echo "  📱 Message listener for incoming WA"
echo "  🔍 Regex pattern matching for 8 couriers"
echo "  📦 Auto-fetch tracking status"
echo "  💬 Smart reply with status info"
echo "  💳 Subscription billing check"

echo ""
echo ">>> Supported Couriers (Resi Patterns):"
echo "  JNE      : JP1234567890"
echo "  J&T      : 000123456789012"
echo "  SiCepat  : SC1234567890"
echo "  Anteraja : 10001234567890"
echo "  Ninja    : NVID12345678"
echo "  POS      : CN1234567890123"
echo "  Wahana   : AGK1234567890"
echo "  Lion     : LEX1234567890"

echo ""
echo ">>> Subscription Plans:"
echo "  FREE       : 0 auto-reply (manual only)"
echo "  BASIC      : 100/day, Rp 50k/mo"
echo "  PREMIUM    : 1000/day, Rp 150k/mo"
echo "  ENTERPRISE : Unlimited, Rp 500k/mo"

echo ""
echo ">>> Auto-Reply Flow:"
echo "  1. Customer sends WA with resi number"
echo "  2. Bot detects resi pattern"
echo "  3. Check seller subscription"
echo "  4. Fetch tracking status from API"
echo "  5. Send formatted reply with status"

echo ""
echo ">>> Reply Template Example:"
echo "  'Halo kak 👋"
echo "  📦 No. Resi: JP1234567890"
echo "  📍 Status: Paket dalam perjalanan"
echo "  📅 Estimasi: Besok, 14:00-18:00"
echo "  _Powered by CekKirim.com_'"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "Settings Page: /dashboard/wa-bot (Settings tab)"
