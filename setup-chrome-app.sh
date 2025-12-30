#!/bin/bash

# =============================================================================
# Chrome Extension Generator (CekKirim Mini Helper)
# =============================================================================

echo "Initializing Chrome Extension Project..."
echo "================================================="

EXT_DIR="chrome-extension"
mkdir -p "$EXT_DIR"

# 1. Manifest V3 (Merged: Context Menu + Popup)
echo "1. Creating manifest.json (Merged Config)..."
cat <<EOF > "$EXT_DIR/manifest.json"
{
  "manifest_version": 3,
  "name": "CekKirim - Cek Resi Cepat",
  "version": "1.1.0",
  "description": "Ekstensi browser untuk cek resi dan ongkir instan tanpa membuka website berulang kali.",
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

# 2. Popup UI (HTML)
echo "2. Creating popup.html..."
cat <<EOF > "$EXT_DIR/popup.html"
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        width: 320px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 0;
        margin: 0;
        background-color: #f8fafc;
      }
      .container {
        padding: 20px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
      }
      .header h1 {
        font-size: 18px;
        color: #0f172a;
        margin: 0;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        font-size: 12px;
        color: #64748b;
        margin-bottom: 5px;
        font-weight: 600;
      }
      input, select {
        width: 100%;
        padding: 10px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 14px;
        box-sizing: border-box; /* Fix padding issue */
        outline: none;
      }
      input:focus, select:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
      button {
        width: 100%;
        padding: 12px;
        background-color: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      button:hover {
        background-color: #1d4ed8;
      }
      .footer {
        margin-top: 15px;
        text-align: center;
        font-size: 11px;
        color: #94a3b8;
      }
      .footer a {
        color: #3b82f6;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <!-- Placeholder Icon -->
        <div style="width: 24px; height: 24px; background: #2563eb; border-radius: 6px;"></div>
        <h1>CekKirim Express</h1>
      </div>

      <div class="form-group">
        <label for="courier">Ekspedisi</label>
        <select id="courier">
          <option value="jne">JNE</option>
          <option value="jnt">J&T</option>
          <option value="sicepat">SiCepat</option>
          <option value="anteraja">AnterAja</option>
          <option value="tiki">TIKI</option>
          <option value="pos">POS Indonesia</option>
        </select>
      </div>

      <div class="form-group">
        <label for="resi">Nomor Resi</label>
        <input type="text" id="resi" placeholder="Contoh: JP1234567890" />
      </div>

      <button id="checkBtn">Lacak Paket</button>

      <div class="footer">
        Powered by <a href="https://cekkirim.com" target="_blank">CekKirim.com</a>
      </div>
    </div>
    <script src="popup.js"></script>
  </body>
</html>
EOF

# 3. Popup Logic (JS)
echo "3. Creating popup.js..."
cat <<EOF > "$EXT_DIR/popup.js"
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('checkBtn');
  const resiInput = document.getElementById('resi');
  const courierInput = document.getElementById('courier');

  // Load last used courier if available
  chrome.storage.local.get(['lastCourier'], function(result) {
    if (result.lastCourier) {
      courierInput.value = result.lastCourier;
    }
  });

  btn.addEventListener('click', function() {
    const resi = resiInput.value.trim();
    const courier = courierInput.value;

    if (!resi) {
      alert('Mohon masukkan nomor resi.');
      return;
    }

    // Save preference
    chrome.storage.local.set({ lastCourier: courier });

    // Construct URL (Adjust based on your actual route structure)
    // Assuming format: https://cekkirim.com/cek-resi?courier=jne&resi=123
    const targetUrl = \`https://cekkirim.com/cek-resi?courier=\${courier}&resi=\${resi}\`;

    // Open in new tab
    chrome.tabs.create({ url: targetUrl });
  });
  
  // Enter key support
  resiInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        btn.click();
    }
  });
});
EOF

# 4. Icon Placeholders
echo "4. Creating Icon Placeholders..."
mkdir -p "$EXT_DIR/icons"
touch "$EXT_DIR/icons/icon16.png"
touch "$EXT_DIR/icons/icon48.png"
touch "$EXT_DIR/icons/icon128.png"

# 5. Build Script (Zip)
echo "5. Creating build script..."
cat <<EOF > "$EXT_DIR/build-ext.sh"
#!/bin/bash
zip -r cekkirim-extension.zip . -x "*.DS_Store" -x "build-ext.sh"
echo "Extension packed: cekkirim-extension.zip"
EOF
chmod +x "$EXT_DIR/build-ext.sh"

echo ""
echo "================================================="
echo "Chrome Extension Setup Complete!"
echo "Folder: $EXT_DIR/"
echo ""
echo "Merged Features:"
echo "- Context Menu (Right Click)"
echo "- Popup UI (Mini Helper)"
echo ""
echo "How to Test:"
echo "1. Open Chrome -> Go to chrome://extensions/"
echo "2. Click the 'Reload' (circular arrow) button."
echo "3. Click Extension Icon to test Popup."
