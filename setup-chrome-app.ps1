# Chrome Extension Generator (CekKirim Mini Helper) (PowerShell)

Write-Host "Initializing Chrome Extension Project..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$EXT_DIR = "chrome-extension"
if (!(Test-Path $EXT_DIR)) { New-Item -ItemType Directory -Force -Path $EXT_DIR | Out-Null }

# 1. Manifest V3 (Merged: Context Menu + Popup)
Write-Host "1. Creating manifest.json (Merged Config)..." -ForegroundColor Yellow

$manifestContent = @'
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
'@
$manifestContent | Set-Content -Path "$EXT_DIR\manifest.json" -Encoding UTF8

# 2. Popup UI (HTML)
Write-Host "2. Creating popup.html..." -ForegroundColor Yellow
$popupHtml = @'
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
'@
$popupHtml | Set-Content -Path "$EXT_DIR\popup.html" -Encoding UTF8

# 3. Popup Logic (JS)
Write-Host "3. Creating popup.js..." -ForegroundColor Yellow
$popupJs = @'
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
    const targetUrl = `https://cekkirim.com/cek-resi?courier=${courier}&resi=${resi}`;

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
'@
$popupJs | Set-Content -Path "$EXT_DIR\popup.js" -Encoding UTF8

# 4. Icon Placeholders
Write-Host "4. Creating Icon Placeholders..." -ForegroundColor Yellow
if (!(Test-Path "$EXT_DIR\icons")) { New-Item -ItemType Directory -Force -Path "$EXT_DIR\icons" | Out-Null }
New-Item -ItemType File -Force -Path "$EXT_DIR\icons\icon16.png" | Out-Null
New-Item -ItemType File -Force -Path "$EXT_DIR\icons\icon48.png" | Out-Null
New-Item -ItemType File -Force -Path "$EXT_DIR\icons\icon128.png" | Out-Null

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Chrome Extension Setup Complete!" -ForegroundColor Green
Write-Host "Folder: $EXT_DIR\" -ForegroundColor White
Write-Host ""
Write-Host "Merged Features:" -ForegroundColor White
Write-Host "- Context Menu (Right Click)" -ForegroundColor White
Write-Host "- Popup UI (Mini Helper)" -ForegroundColor White
Write-Host ""
Write-Host "How to Test:" -ForegroundColor White
Write-Host "1. Open Chrome -> Go to chrome://extensions/" -ForegroundColor White
Write-Host "2. Click the 'Reload' (circular arrow) button." -ForegroundColor White
Write-Host "3. Click Extension Icon to test Popup." -ForegroundColor White
