#!/bin/bash

# =============================================================================
# Setup Chrome Extension (Phase 121)
# CekKirim Helper (Manifest V3)
# =============================================================================

echo "Setting up Chrome Extension Base..."
echo "================================================="
echo ""

# 1. Directory Structure
echo "1. Creating Directory: extension/"
mkdir -p extension/icons
mkdir -p extension/popup

# 2. Manifest V3
echo "2. Creating Manifest: extension/manifest.json"

cat <<EOF > extension/manifest.json
{
  "manifest_version": 3,
  "name": "CekKirim Helper",
  "version": "1.0.0",
  "description": "Cek Ongkir & Resi Instan untuk Seller.",
  "permissions": ["activeTab", "storage", "scripting"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "host_permissions": [
    "https://cekkirim.com/*"
  ]
}
EOF
echo "   [✓] manifest.json created."
echo ""

# 3. Popup UI (HTML/CSS/JS)
echo "3. Creating Popup: extension/popup/"

# HTML
cat <<EOF > extension/popup/popup.html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">
        <span class="logo-box">CK</span>
        <h1>CekKirim</h1>
      </div>
      <span class="badge">Helper</span>
    </div>

    <!-- Main Content -->
    <div class="content">
      <label for="resiInput">Cek Resi Instan</label>
      <div class="input-group">
        <input type="text" id="resiInput" placeholder="Tempel nomor resi..." autofocus>
        <button id="clearBtn" title="Clear">✖</button>
      </div>
      
      <button id="trackBtn">Lacak Paket 🚀</button>

      <div class="divider">ATAU</div>

      <button id="openWebBtn" class="secondary">Buka Dashboard Seller</button>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Tips: Blok teks resi di web lalu klik kanan (Coming Soon)</p>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
EOF

# CSS
cat <<EOF > extension/popup/popup.css
body {
  width: 320px;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f8fafc;
}

.container {
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-box {
  background: white;
  color: #4f46e5;
  font-weight: 900;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 14px;
}

h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.badge {
  background: rgba(255,255,255,0.2);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.content {
  padding: 20px;
}

label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.input-group {
  position: relative;
  margin-bottom: 16px;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  padding-right: 30px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

#clearBtn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
  display: none;
}

input:not(:placeholder-shown) + #clearBtn {
  display: block;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

#trackBtn {
  background-color: #4f46e5;
  color: white;
  margin-bottom: 12px;
}

#trackBtn:hover {
  opacity: 0.9;
}

.secondary {
  background-color: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.secondary:hover {
  background-color: #f1f5f9;
}

.divider {
  text-align: center;
  font-size: 10px;
  color: #94a3b8;
  margin: 12px 0;
  position: relative;
}

.divider::before, .divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: #e2e8f0;
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.footer {
  background-color: #f1f5f9;
  padding: 12px;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.footer p {
  margin: 0;
  font-size: 10px;
  color: #64748b;
}
EOF

# JS
cat <<EOF > extension/popup/popup.js
document.addEventListener('DOMContentLoaded', function() {
  const resiInput = document.getElementById('resiInput');
  const trackBtn = document.getElementById('trackBtn');
  const openWebBtn = document.getElementById('openWebBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Load last searched resi
  chrome.storage.local.get(['lastResi'], function(result) {
    if (result.lastResi) {
      resiInput.value = result.lastResi;
    }
  });

  // Track function
  function trackResi() {
    const resi = resiInput.value.trim();
    if (!resi) return;

    // Save to history
    chrome.storage.local.set({ lastResi: resi });

    // Open CekKirim in new tab
    const url = 'https://cekkirim.com/cek-resi?q=' + encodeURIComponent(resi);
    chrome.tabs.create({ url: url });
  }

  trackBtn.addEventListener('click', trackResi);
  
  resiInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') trackResi();
  });

  openWebBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://cekkirim.com/dashboard' });
  });

  clearBtn.addEventListener('click', function() {
    resiInput.value = '';
    resiInput.focus();
  });
});
EOF
echo "   [✓] Popup UI created."
echo ""

# 4. Dummy Icons (Placeholder)
echo "4. Generating placeholder icons..."
# In a real scenario, we'd copy image files. 
# Here we'll just create a simple SVG or leave them empty to avoid error if missing, 
# but manifest requires them. Let's create dummy PNGs using simple base64 or just warn user.
# Actually, let's create a node script to generate simple colored squares if node is avail, or just copy a favicon if exists.

if [ -f "public/favicon.ico" ]; then
    echo "   [i] Note: Using placeholder icons. Please replace extension/icons/*.png with real logos before publishing."
    touch extension/icons/icon16.png
    touch extension/icons/icon48.png
    touch extension/icons/icon128.png
else
    echo "   [!] Warning: Please add icon16.png, icon48.png, icon128.png to extension/icons/ manually."
fi
echo ""

# 5. Build Script
echo "5. Creating Build Script: extension/build.sh"
cat <<EOF > extension/build.sh
#!/bin/bash
echo "Building Extension..."
rm -f extension.zip
zip -r extension.zip . -x "*.DS_Store" -x "build.sh"
echo "Done! Upload extension.zip to Chrome Web Store."
EOF
chmod +x extension/build.sh
echo "   [✓] Build script created."
echo ""

echo "================================================="
echo "Setup Complete!"
echo "1. Go to chrome://extensions"
echo "2. Enable Developer Mode"
echo "3. Click 'Load Unpacked' -> Select 'd:/Project Website/Website CekKirim.com/Kirimdotcom/extension/'"
