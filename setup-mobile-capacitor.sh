#!/bin/bash

# setup-mobile-capacitor.sh
# Mobile App Conversion (Phase 1801-1805)

echo ">>> Setting up Capacitor for Mobile App..."

# 1. Install Dependencies
echo ">>> Installing Capacitor Dependencies..."
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor (if not exists)
if [ ! -f "capacitor.config.ts" ]; then
    echo ">>> Initializing Capacitor..."
    npx cap init "Kirim.com" "com.kirimdotcom.app" --web-dir=out
else
    echo ">>> capacitor.config.ts already exists."
fi

# 3. Build Next.js (Static Export Mode)
echo ">>> Building Next.js for Mobile (Static Export)..."
echo ">>> NOTE: Temporarily disabling Middleware for static build compatibility."

# Rename middleware to bypass static export check
if [ -f "src/middleware.ts" ]; then
    mv src/middleware.ts src/_middleware.ts
    MIDDLEWARE_MOVED=true
fi

# Run Build with Export Flag
# We use cross-env logic via standard env var setting in bash
export NEXT_EXPORT=true
npm run build
BUILD_STATUS=$?

# Restore Middleware immediately
if [ "$MIDDLEWARE_MOVED" = true ]; then
    mv src/_middleware.ts src/middleware.ts
    echo ">>> Restored middleware.ts"
fi

if [ $BUILD_STATUS -ne 0 ]; then
    echo ">>> ERROR: Next.js Build Failed."
    exit 1
fi

# 4. Integrate Android
echo ">>> Adding Android Platform..."
npx cap add android

# 5. Sync Assets
echo ">>> Syncing to Android..."
npx cap sync

echo ""
echo ">>> Setup Complete!"
echo ">>> To open Android Studio, run: npx cap open android"
