# Vercel Analytics & Speed Insights Setup (PowerShell)

Write-Host "Initializing Vercel Monitoring..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Install Packages
Write-Host "1. Installing Vercel packages..." -ForegroundColor Yellow
npm install @vercel/analytics @vercel/speed-insights

# 2. Create Wrapper Component
Write-Host "2. Creating Wrapper: src/components/monitoring/VercelMonitoring.tsx" -ForegroundColor Yellow
$dir = "src\components\monitoring"
if (!(Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$componentContent = @'
'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function VercelMonitoring() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
'@
$componentContent | Set-Content -Path "src\components\monitoring\VercelMonitoring.tsx" -Encoding UTF8

# 3. Inject into Root Layout (Safe Node Script)
Write-Host "3. Attempting to inject into src/app/layout.tsx..." -ForegroundColor Yellow

$nodeScript = @'
const fs = require('fs');
const path = require('path');

const layoutPath = path.join('src', 'app', 'layout.tsx');

if (!fs.existsSync(layoutPath)) {
    console.error(' [!] Layout file not found at:', layoutPath);
    process.exit(1);
}

let content = fs.readFileSync(layoutPath, 'utf8');

// Check if already injected
if (content.includes('VercelMonitoring')) {
    console.log(' [i] VercelMonitoring already present in layout.');
    process.exit(0);
}

// 1. Add Import
const importStmt = "import { VercelMonitoring } from '@/components/monitoring/VercelMonitoring';\n";
if (!content.includes(importStmt)) {
    content = importStmt + content;
}

// 2. Inject Component before </body>
if (content.includes('</body>')) {
    content = content.replace('</body>', '        <VercelMonitoring />\n      </body>');
    fs.writeFileSync(layoutPath, content, 'utf8');
    console.log(' [?] Successfully injected <VercelMonitoring /> into layout.');
} else if (content.includes('</Body>')) {
     content = content.replace('</Body>', '        <VercelMonitoring />\n      </Body>');
     fs.writeFileSync(layoutPath, content, 'utf8');
     console.log(' [?] Successfully injected <VercelMonitoring /> into layout.');
} else {
    console.error(' [!] Could not find </body> tag in layout. Please add <VercelMonitoring /> manually.');
}
'@

$nodeScript | Set-Content -Path ".inject-analytics.js" -Encoding UTF8

node .inject-analytics.js
Remove-Item -Path ".inject-analytics.js" -ErrorAction SilentlyContinue

# 4. Usage Guide
Write-Host "4. Generating Guide: VERCEL_ANALYTICS_GUIDE.md" -ForegroundColor Yellow
$guideContent = @'
# Vercel Analytics Setup

## 1. Enable in Dashboard
1. Go to your Vercel Project Dashboard.
2. Click on the **Analytics** tab.
3. Click **Enable**.
4. Do the same for the **Speed Insights** tab.

## 2. Verify
1. Deploy your latest changes.
2. Visit your website.
3. Check the Vercel Dashboard; data should start appearing within minutes.

## Troubleshooting
If the component wasn't auto-injected:
1. Open `src/app/layout.tsx`.
2. Import: `import { VercelMonitoring } from '@/components/monitoring/VercelMonitoring';`
3. Add `<VercelMonitoring />` inside the `<body>` tag.
'@
$guideContent | Set-Content -Path "VERCEL_ANALYTICS_GUIDE.md" -Encoding UTF8

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "Check VERCEL_ANALYTICS_GUIDE.md for activation steps." -ForegroundColor White
