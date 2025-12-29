#!/bin/bash

# =============================================================================
# Build CekKirim Chrome Extension
# Creates distributable ZIP file
# =============================================================================

echo "Building CekKirim Chrome Extension..."
echo "================================================="

# Remove old build
if [ -f "cekkirim-extension.zip" ]; then
    rm cekkirim-extension.zip
    echo "✓ Removed old build"
fi

# Create ZIP (exclude build script and other unnecessary files)
zip -r cekkirim-extension.zip \
    manifest.json \
    popup/ \
    background/ \
    content/ \
    sidebar/ \
    icons/ \
    -x "*.DS_Store" \
    -x "build.sh" \
    -x "manifest.example.json"

echo ""
echo "================================================="
echo "✅ Build Complete!"
echo ""
echo "Output: cekkirim-extension.zip"
echo ""
echo "Next Steps:"
echo "1. Test locally first (Load Unpacked in chrome://extensions)"
echo "2. Upload to Chrome Web Store Developer Dashboard"
echo "3. Fill in store listing details"
echo "4. Submit for review"
echo ""
echo "Files included:"
echo "  ✓ Popup UI (Phase 121)"
echo "  ✓ WhatsApp Sidebar (Phase 122)"
echo "  ✓ Context Menu (Phase 123)"
echo "  ✓ Background Service Worker"
echo "  ✓ Icons & Assets"
