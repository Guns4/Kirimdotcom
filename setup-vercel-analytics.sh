#!/bin/bash

# =============================================================================
# Vercel Analytics & Speed Insights Setup
# =============================================================================

echo "Initializing Vercel Monitoring..."
echo "================================================="

# 1. Install Packages
echo "1. Installing Vercel packages..."
npm install @vercel/analytics @vercel/speed-insights

# 2. Create Wrapper Component
echo "2. Creating Wrapper: src/components/monitoring/VercelMonitoring.tsx"
mkdir -p src/components/monitoring

cat <<EOF > src/components/monitoring/VercelMonitoring.tsx
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
EOF

# 3. Inject into Root Layout (Safe Node Script)
echo "3. Attempting to inject into src/app/layout.tsx..."

cat <<EOF > .inject-analytics.js
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
} else {
    console.error(' [!] Could not find </body> tag in layout. Please add <VercelMonitoring /> manually.');
}
EOF

# Run the injection script
node .inject-analytics.js
rm .inject-analytics.js

# 4. Usage Guide
echo "4. Generating Guide: VERCEL_ANALYTICS_GUIDE.md"
cat <<EOF > VERCEL_ANALYTICS_GUIDE.md
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
1. Open \`src/app/layout.tsx\`.
2. Import: \`import { VercelMonitoring } from '@/components/monitoring/VercelMonitoring';\`
3. Add \`<VercelMonitoring />\` inside the \`<body>\` tag.
EOF

echo ""
echo "================================================="
echo "Setup Complete!"
echo "Check VERCEL_ANALYTICS_GUIDE.md for activation steps."
