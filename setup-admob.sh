#!/bin/bash

# setup-admob.sh
# Passive Income - AdMob Integration (Phase 1821-1825)

echo ">>> Setting up AdMob..."

# 1. Install Plugin
echo ">>> Installing @capacitor-community/admob..."
npm install @capacitor-community/admob --save

# 2. Components Created:
# - src/hooks/useAdMob.ts (Banner & Interstitial Logic)

echo ">>> Integration Instructions:"
echo "1. Android Manifest Update (android/app/src/main/AndroidManifest.xml):"
echo "   add inside <application>:"
echo "   <meta-data android:name='com.google.android.gms.ads.APPLICATION_ID' android:value='ca-app-pub-YOUR-APP-ID'/>"

echo "2. Usage:"
echo "   import { useAdMob } from '@/hooks/useAdMob';"
echo "   const { incrementAdCounter } = useAdMob();"
echo "   // Call incrementAdCounter() whenever a user does a key action (e.g. tracking)"

echo "3. Config:"
echo "   Add NEXT_PUBLIC_ADMOB_BANNER_ID and NEXT_PUBLIC_ADMOB_INTERSTITIAL_ID to .env"

echo ""
echo ">>> Running Typecheck..."
npm run typecheck

echo ""
echo ">>> Setup Complete!"
