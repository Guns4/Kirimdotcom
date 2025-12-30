#!/bin/bash

# =============================================================================
# Chrome Extension Upgrade: Context Menu (Right Click Tracking)
# =============================================================================

echo "Upgrading Chrome Extension with Context Menu..."
echo "================================================="

EXT_DIR="chrome-extension"
mkdir -p "$EXT_DIR"

# 1. Update Manifest V3 (Adding background & contextMenus)
echo "1. Updating manifest.json..."
cat <<EOF > "$EXT_DIR/manifest.json"
{
  "manifest_version": 3,
  "name": "CekKirim - Cek Resi Cepat",
  "version": "1.1.0",
  "description": "Ekstensi browser untuk cek resi dan ongkir instan.",
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "permissions": ["activeTab", "storage", "contextMenus"],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
EOF

# 2. Create Background Worker
echo "2. Creating background.js..."
cat <<EOF > "$EXT_DIR/background.js"
// 1. Create Context Menu on Install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cekkirim-track",
    title: "Lacak \"%s\" di CekKirim", 
    contexts: ["selection"]
  });
});

// 2. Handle Click Events
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cekkirim-track" && info.selectionText) {
    // Sanitize and encode the selection
    const resi = encodeURIComponent(info.selectionText.trim());
    
    // Open Tracking Page
    // Make sure this route matches your Next.js app structure
    const targetUrl = \`https://cekkirim.com/cek-resi?resi=\${resi}&auto=true\`;
    
    chrome.tabs.create({
      url: targetUrl
    });
  }
});
EOF

echo ""
echo "================================================="
echo "Context Menu Feature Added!"
echo "Folder: $EXT_DIR/"
echo ""
echo "Installation Update:"
echo "1. Go to chrome://extensions/"
echo "2. Click the 'Reload' (circular arrow) button on your CekKirim extension card."
echo "   (Or 'Load Unpacked' if not installed yet)."
echo "3. Test it: Highlight any text on a webpage -> Right Click -> Select 'Lacak di CekKirim'."
