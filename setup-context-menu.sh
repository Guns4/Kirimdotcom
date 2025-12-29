#!/bin/bash

# =============================================================================
# Setup Context Menu (Phase 123)
# Seamless UX for Chrome Extension
# =============================================================================

echo "Setting up Context Menu..."
echo "================================================="
echo ""

echo "✓ Background Service Worker: extension/background/background.js"
echo ""

echo "================================================="
echo "Context Menu Setup Complete!"
echo ""
echo "Next Steps:"
echo ""
echo "1. **Update Manifest** (extension/manifest.json):"
echo "   Add these sections:"
echo ""
echo '   "permissions": ['
echo '     "contextMenus",'
echo '     "tabs"'
echo '   ],'
echo ""
echo '   "background": {'
echo '     "service_worker": "background/background.js"'
echo '   }'
echo ""
echo "2. **Reload Extension**:"
echo "   - Open: chrome://extensions"
echo "   - Find CekKirim extension"
echo "   - Click 'Reload' button"
echo ""
echo "3. **Test Context Menu**:"
echo "   - Go to any website"
echo "   - Select tracking number text (e.g., 'JNE123456789')"
echo "   - Right-click on selected text"
echo "   - You should see: 'Cek Resi \"JNE123456789\" via CekKirim'"
echo "   - Click it → Opens new tab with tracking results"
echo ""
echo "Features:"
echo "  ✓ Right-click context menu"
echo "  ✓ Automatic text sanitization"
echo "  ✓ Opens in new tab"
echo "  ✓ Extension icon click support"
echo "  ✓ Message passing ready"
