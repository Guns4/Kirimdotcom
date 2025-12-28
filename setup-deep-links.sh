#!/bin/bash

# =============================================================================
# Setup Deep Links Config (Phase 95)
# Android App Links & iOS Universal Links
# =============================================================================

echo "Setting up Deep Linking (User Experience Continuity)..."
echo "================================================="
echo ""

# Create directory
mkdir -p public/.well-known

# 1. Android App Links (assetlinks.json)
echo "1. Configuring Android App Links..."
echo "   File: public/.well-known/assetlinks.json"
# (File created via tool)

# 2. iOS Universal Links (apple-app-site-association)
echo "2. Configuring iOS Universal Links..."
echo "   File: public/.well-known/apple-app-site-association"
# (File created via tool)

# 3. Fallback Info
echo "3. Deep Link Logic:"
echo "   - If App installed: Opens directly in App."
echo "   - If App NOT installed: Opens normal Web URL (Fallback is automatic)."
echo "   - Google/Apple verify these files to valid ownership."
echo ""

# Instructions
echo "Next Steps:"
echo "1. Android: Replace 'REPLACE_WITH_YOUR_...' in assetlinks.json with real generic SHA256."
echo "   (Get this from KeyStore or Play Console -> App Signing)."
echo "2. iOS: Replace 'TEAM_ID' in apple-app-site-association."
echo "3. Deploy to Production (Must be HTTPS)."
echo ""

echo "================================================="
echo "Setup Complete!"
