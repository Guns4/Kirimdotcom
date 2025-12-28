#!/bin/bash

# =============================================================================
# Setup WA Sidebar Injector (Phase 122)
# High Utility Feature for Sellers
# =============================================================================

echo "Setting up WA Sidebar Injector..."
echo "================================================="
echo ""

# 1. Update Manifest
echo "1. Updating Manifest (Injecting Content Script)..."

# We use a temporary node script to safely edit the JSON
cat <<EOF > update-manifest-wa.js
const fs = require('fs');
const path = 'extension/manifest.json';

try {
    const data = fs.readFileSync(path, 'utf8');
    const manifest = JSON.parse(data);

    // Add Content Script for WA
    manifest.content_scripts = [
        {
            "matches": ["https://web.whatsapp.com/*"],
            "js": ["content/wa-injector.js"],
            "run_at": "document_idle"
        }
    ];
    
    // Add Web Accessible Resources (Sidebar)
    manifest.web_accessible_resources = [
        {
            "resources": ["sidebar/sidebar.html", "sidebar/sidebar.css", "sidebar/sidebar.js"],
            "matches": ["https://web.whatsapp.com/*"]
        }
    ];

    fs.writeFileSync(path, JSON.stringify(manifest, null, 2));
    console.log('Manifest updated successfully.');
} catch (err) {
    console.error('Error updating manifest:', err);
    process.exit(1);
}
EOF

if node update-manifest-wa.js; then
    rm update-manifest-wa.js
    echo "   [✓] Manifest updated."
else
    echo "   [!] Error: Node.js required to update manifest safely."
fi
echo ""

# 2. Create Directories
mkdir -p extension/content
mkdir -p extension/sidebar

# 3. Content Script (The Injector)
echo "3. Creating Injector: extension/content/wa-injector.js"

cat <<EOF > extension/content/wa-injector.js
console.log('[CekKirim] WA Injector Loaded');

function injectSidebar() {
    // Prevent double injection
    if (document.getElementById('cekkirim-sidebar-frame')) return;

    // 1. Resize WA Main Container to make space
    const waApp = document.getElementById('app');
    if (waApp) {
        waApp.style.width = 'calc(100% - 300px)'; // Shrink WA
        waApp.style.transition = 'width 0.3s ease';
    } else {
        // Retry if #app not found (maybe loading)
        setTimeout(injectSidebar, 1000);
        return;
    }

    // 2. Create Iframe Container
    const sidebar = document.createElement('iframe');
    sidebar.id = 'cekkirim-sidebar-frame';
    sidebar.src = chrome.runtime.getURL('sidebar/sidebar.html');
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '300px';
    sidebar.style.height = '100vh';
    sidebar.style.border = 'none';
    sidebar.style.zIndex = '9999';
    sidebar.style.boxShadow = '-2px 0 5px rgba(0,0,0,0.1)';
    sidebar.style.background = '#f0f2f5';

    document.body.appendChild(sidebar);
    console.log('[CekKirim] Sidebar Injected');
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSidebar);
} else {
    // Wait a bit for WA to fully render dynamic elements
    setTimeout(injectSidebar, 2000);
}
EOF
echo "   [✓] Injector script created."
echo ""

# 4. Sidebar UI (The Tool)
echo "4. Creating Sidebar: extension/sidebar/sidebar.html"

cat <<EOF > extension/sidebar/sidebar.html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="sidebar.css">
</head>
<body>
  <div class="header">
    <h3>Cek Ongkir Cepat</h3>
  </div>
  
  <div class="content">
    <div class="form-group">
      <label>Asal (Kota)</label>
      <input type="text" id="origin" placeholder="Cth: Jakarta" value="Jakarta">
    </div>

    <div class="form-group">
      <label>Tujuan (Kecamatan/Kota)</label>
      <input type="text" id="destination" placeholder="Cth: Bandung" autofocus>
    </div>

    <div class="form-group">
      <label>Berat (Gram)</label>
      <input type="number" id="weight" value="1000">
    </div>

    <button id="checkBtn">Cek Harga</button>

    <div id="results" class="results-area">
       <!-- Results will appear here -->
       <div class="placeholder">
          Hasil cek ongkir akan muncul di sini.
       </div>
    </div>
  </div>

  <script src="sidebar.js"></script>
</body>
</html>
EOF

# Sidebar CSS
cat <<EOF > extension/sidebar/sidebar.css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
  color: #111b21;
}

.header {
  background-color: #008069; /* WA Green */
  color: white;
  padding: 16px;
  text-align: center;
}

.header h3 { margin: 0; font-size: 16px; }

.content { padding: 16px; }

.form-group { margin-bottom: 12px; }

label {
  display: block;
  font-size: 12px;
  color: #54656f;
  margin-bottom: 4px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dfe1e5;
  border-radius: 6px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #008069;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 8px;
}

button:hover { background-color: #006d59; }

.results-area {
  margin-top: 20px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-height: 100px;
}

.placeholder {
  color: #8696a0;
  font-size: 12px;
  text-align: center;
  margin-top: 30px;
}

.result-item {
  border-bottom: 1px solid #f0f2f5;
  padding: 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.courier { font-weight: bold; font-size: 13px; }
.service { font-size: 11px; color: #54656f; }
.price { color: #008069; font-weight: bold; }
.copy-btn {
  background: none;
  border: 1px solid #dfe1e5;
  color: #54656f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  width: auto;
  margin-top: 0;
}
.copy-btn:hover { background: #f0f2f5; }
EOF

# Sidebar JS (Mock Logic for now)
cat <<EOF > extension/sidebar/sidebar.js
document.getElementById('checkBtn').addEventListener('click', function() {
    const dest = document.getElementById('destination').value;
    const weight = document.getElementById('weight').value;
    const resultsDiv = document.getElementById('results');

    if (!dest) {
        alert('Mohon isi tujuan');
        return;
    }

    // Mock API Call (In real world, fetch from https://cekkirim.com/api/v1/cost)
    resultsDiv.innerHTML = '<div style="text-align:center">Loading...</div>';

    setTimeout(() => {
        // Mock Data
        const data = [
            { code: 'JNE', service: 'REG', price: 10000, etd: '1-2 Hari' },
            { code: 'J&T', service: 'EZ', price: 11000, etd: '2 Hari' },
            { code: 'SiCepat', service: 'REG', price: 9500, etd: '1-2 Hari' }
        ];

        let html = '';
        data.forEach(item => {
            const textToCopy = \`Ongkir \${item.code} \${item.service}: Rp \${item.price.toLocaleString('id-ID')}\`;
            html += \`
                <div class="result-item">
                    <div>
                        <div class="courier">\${item.code} - \${item.service}</div>
                        <div class="service">\${item.etd}</div>
                    </div>
                    <div style="text-align:right">
                        <div class="price">Rp \${item.price.toLocaleString('id-ID')}</div>
                        <button class="copy-btn" data-text="\${textToCopy}">Copy</button>
                    </div>
                </div>
            \`;
        });
        resultsDiv.innerHTML = html;

        // Add Copy Listeners
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                navigator.clipboard.writeText(e.target.dataset.text);
                e.target.innerText = 'Copied!';
                setTimeout(() => e.target.innerText = 'Copy', 1000);
            });
        });

    }, 800);
});
EOF
echo "   [✓] Sidebar UI created."
echo ""

echo "================================================="
echo "Setup Complete!"
echo "1. Reload extension in chrome://extensions"
echo "2. Open https://web.whatsapp.com"
echo "3. You should see CekKirim Sidebar on the right!"
