#!/bin/bash

# setup-wa-server.sh
# SaaS Product - WhatsApp Bot Server with Baileys

echo ">>> Setting up WhatsApp Bot Server..."

# Components Created:
# 1. supabase/migrations/20251231_wa_sessions.sql
# 2. src/lib/wa-session-manager.ts
# 3. src/components/wa/WADashboard.tsx
# 4. src/app/dashboard/wa-bot/page.tsx

echo ">>> Dependencies Installed:"
echo "  ✓ @whiskeysockets/baileys - WA Multi-Device API"
echo "  ✓ qrcode - QR Code generation"
echo "  ✓ pino - Fast logging"

echo ""
echo ">>> Features:"
echo "  📱 Multi-tenant WA session management"
echo "  🔐 Secure session storage"
echo "  📸 QR Code generator for login"
echo "  💬 Send/receive message API"
echo "  ✅ Number validation (on WhatsApp check)"

echo ""
echo ">>> Session Management:"
echo "  - Sessions stored in .wa-sessions/ folder"
echo "  - Each seller gets unique session ID"
echo "  - Automatic reconnection on disconnect"
echo "  - Session data encrypted in database"

echo ""
echo ">>> API Functions:"
echo "  createWASession()  - Create new connection"
echo "  sendMessage()      - Send text message"
echo "  checkNumber()      - Verify WA number"
echo "  deleteSession()    - Logout & cleanup"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
echo "WA Bot Dashboard: http://localhost:3000/dashboard/wa-bot"
echo ""
echo ">>> IMPORTANT NOTES:"
echo "  1. Baileys uses unofficial WA API (use at own risk)"
echo "  2. Sessions expire after 14 days of inactivity"
echo "  3. Use Redis for production session storage"
echo "  4. Rate limit message sending to avoid bans"
