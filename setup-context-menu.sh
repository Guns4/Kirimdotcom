#!/bin/bash

# =============================================================================
# Setup Context Menu (Phase 123)
# Seamless UX for Chrome Extension
# =============================================================================

echo "Setting up Context Menu..."
echo "================================================="
echo ""

# 1. Update Manifest
echo "1. Updating Manifest (Adding Context Menus part)..."

cat <<EOF > update-manifest-ctx.js
const fs = require('fs');
const path = 'extension/manifest.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const manifest = JSON.parse(data);

    // Add Permissions
    if (!manifest.permissions.includes('contextMenus')) {
        manifest.permissions.push('contextMenus');
    }

    // Add Background Service Worker
    manifest.background = {
        "service_worker": "background/background.js"
    };

    fs.writeFileSync(path, JSON.stringify(manifest, null, 2));
    console.log('Manifest updated successfully.');
} catch (err) {
    console.error('Error updating manifest:', err);
    process.exit(1);
}
EOF

if node update-manifest-ctx.js; then
    rm update-manifest-ctx.js
    echo "   [✓] Manifest updated."
else
    echo "   [!] Error: Node.js required to update manifest."
fi
echo ""

# 2. Create Directory
mkdir -p extension/background

# 3. Background Script
echo "3. Creating Background Worker: extension/background/background.js"

cat <<EOF > extension/background/background.js
// Initialize Context Menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cekkirim-track",
    title: "Cek Resi \"%s\" via CekKirim", 
    contexts: ["selection"] // Only show when text is selected
  });
});

// Handle Click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cekkirim-track" && info.selectionText) {
    
    // 1. Sanitize Text (Remove non-alphanumeric except dashes)
    let rawText = info.selectionText.trim();
    // Regex logic can be expanded here. For now, we take the raw selection.
    
    // 2. Open New Tab
    const trackingUrl = \`https://cekkirim.com/cek-resi?q=\${encodeURIComponent(rawText)}\`;
    
    chrome.tabs.create({
        url: trackingUrl
    });
  }
});
EOF
echo "   [✓] Background script created."
echo ""

echo "================================================="
echo "Setup Complete!"
echo "1. Reload extension in chrome://extensions"
echo "2. Select any text on a webpage -> Right Click"
echo "3. You should see 'Cek Resi ... via CekKirim'"
