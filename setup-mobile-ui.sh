#!/bin/bash

# setup-mobile-ui.sh
# Native UI/UX (Phase 1806-1810)

echo ">>> Setting up Native Mobile UI/UX..."

# 1. Install Capacitor Plugins
echo ">>> Installing Plugins..."
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/app @capacitor/assets --save

# 2. Configure Assets
echo ">>> Setting up Assets Structure..."
mkdir -p assets
# Ensure we have a base icon/splash (Using placeholder if not exists)
# User should replace these later
if [ ! -f "assets/icon.png" ]; then
    # Create dummy files to avoid errors if user runs generation immediately
    # Ideally checking for existing logo in public
    if [ -f "public/logo.png" ]; then
        cp public/logo.png assets/icon.png
        cp public/logo.png assets/splash.png
        echo ">>> Copied public/logo.png to assets/"
    else
        echo ">>> WARNING: No logo found in public/logo.png. Please put 'icon.png' (1024x1024) and 'splash.png' (2732x2732) in 'assets/' folder."
    fi
fi

# 3. Generate Assets (Auto-Crop)
# Only runs if files exist
if [ -f "assets/icon.png" ]; then
    echo ">>> Generating Icons & Splash Screens..."
    npx capacitor-assets generate --android
fi

# 4. Integrate Provider (Instructional)
echo ""
echo ">>> IMPORTANT INTEGRATION STEP:"
echo "    Please wrap your layout with <MobileProvider> in src/app/layout.tsx (or main layout)."
echo "    import { MobileProvider } from '@/providers/MobileProvider';"

# 5. Sync Config
echo ">>> Syncing Capacitor..."
npx cap sync

echo ""
echo ">>> Setup Complete!"
