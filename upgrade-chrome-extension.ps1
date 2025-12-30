# Chrome Extension Upgrade (PowerShell)

Write-Host "Upgrading Chrome Extension with Context Menu..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$EXT_DIR = "chrome-extension"
if (!(Test-Path $EXT_DIR)) { New-Item -ItemType Directory -Force -Path $EXT_DIR | Out-Null }

# 1. Update Manifest V3
Write-Host "1. Updating manifest.json..." -ForegroundColor Yellow

$manifestContent = @'
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
'@

$manifestContent | Set-Content -Path "$EXT_DIR\manifest.json" -Encoding UTF8

# 2. Create Background Worker
Write-Host "2. Creating background.js..." -ForegroundColor Yellow

$bgContent = @'
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
    const targetUrl = `https://cekkirim.com/cek-resi?resi=${resi}&auto=true`;
    
    chrome.tabs.create({
      url: targetUrl
    });
  }
});
'@

$bgContent | Set-Content -Path "$EXT_DIR\background.js" -Encoding UTF8

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Context Menu Feature Added!" -ForegroundColor Green
Write-Host "Folder: $EXT_DIR/" -ForegroundColor White
Write-Host ""
Write-Host "Installation Update:" -ForegroundColor White
Write-Host "1. Go to chrome://extensions/" -ForegroundColor White
Write-Host "2. Click the 'Reload' (circular arrow) button on your CekKirim extension card." -ForegroundColor White
Write-Host "   (Or 'Load Unpacked' if not installed yet)." -ForegroundColor White
Write-Host "3. Test it: Highlight any text on a webpage -> Right Click -> Select 'Lacak di CekKirim'." -ForegroundColor White
