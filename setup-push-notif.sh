#!/bin/bash

# setup-push-notif.sh
# Retention & Marketing - OneSignal Integration (Phase 1816-1820)

echo ">>> Setting up Push Notifications (OneSignal)..."

# 1. Install Dependencies
# We install the client SDK for React/Next.js
echo ">>> Installing Client SDK..."
npm install react-onesignal --save

# 2. Components Created:
# - src/lib/onesignal.ts (Server-side sending logic)

echo ">>> Integration Instructions:"
echo "1. Sign up at OneSignal.com and get APP ID & API KEY."
echo "2. Add to .env:"
echo "   ONESIGNAL_APP_ID=..."
echo "   ONESIGNAL_API_KEY=..."
echo "3. Initialize in your Layout or Provider:"
echo "   import OneSignal from 'react-onesignal';"
echo "   useEffect(() => {"
echo "     OneSignal.init({ appId: 'YOUR-APP-ID' });"
echo "   }, []);"

echo ""
echo ">>> Features Enabled:"
echo "  - notifyTrackingUpdate(userId, resi, status) -> Deep Link to /tracking/[resi]"
echo "  - notifyBalanceUpdate(userId, amount) -> Deep Link to /wallet"
echo "  - broadcastNotification() -> For Marketing Blasts"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
