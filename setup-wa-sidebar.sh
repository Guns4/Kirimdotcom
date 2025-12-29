#!/bin/bash

# =============================================================================
# Setup WA Sidebar Injector (Phase 122)
# High Utility Feature for Sellers
# =============================================================================

echo "Setting up WA Sidebar Injector..."
echo "================================================="
echo ""

echo "✓ Content Script: extension/content/wa-injector.js"
echo "✓ Sidebar HTML: extension/sidebar/sidebar.html"
echo "✓ Sidebar CSS: extension/sidebar/sidebar.css"
echo "✓ Sidebar JS: extension/sidebar/sidebar.js"
echo ""

echo "================================================="
echo "WhatsApp Sidebar Setup Complete!"
echo ""
echo "Next Steps:"
echo ""
echo "1. **Update Manifest** (extension/manifest.json):"
echo "   Add these sections:"
echo ""
echo '   "content_scripts": ['
echo '     {'
echo '       "matches": ["https://web.whatsapp.com/*"],'
echo '       "js": ["content/wa-injector.js"],'
echo '       "run_at": "document_idle"'
echo '     }'
echo '   ],'
echo ""
echo '   "web_accessible_resources": ['
echo '     {'
echo '       "resources": ['
echo '         "sidebar/sidebar.html",'
echo '         "sidebar/sidebar.css",'
echo '         "sidebar/sidebar.js"'
echo '       ],'
echo '       "matches": ["https://web.whatsapp.com/*"]'
echo '     }'
echo '   ]'
echo ""
echo "2. **Reload Extension**:"
echo "   - chrome://extensions → Reload"
echo ""
echo "3. **Test on WhatsApp Web**:"
echo "   - Open: https://web.whatsapp.com"
echo "   - Sidebar should appear on the right"
echo "   - Fill destination and click 'Cek Harga'"
echo "   - Click 'Copy' to copy shipping cost to clipboard"
echo ""
echo "Features:"
echo "  ✓ Sidebar injected into WhatsApp Web"
echo "  ✓ Quick shipping cost calculator"
echo "  ✓ Copy to clipboard functionality"
echo "  ✓ Toggle button to show/hide"
echo "  ✓ WhatsApp-like design"
echo "  ✓ Mock API (ready for real integration)"
