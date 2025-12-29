#!/bin/bash

# =============================================================================
# Vercel Speed Insights & Analytics (Real User Monitoring)
# =============================================================================

echo "Initializing Vercel Insights..."
echo "================================================="

# 1. Install Dependencies
echo "1. Installing packages..."
npm install @vercel/speed-insights @vercel/analytics

# 2. Create Component Wrapper
# Best practice: Create a client component wrapper to keep layout.tsx clean
echo "2. Creating Wrapper: src/components/monitoring/VercelInsights.tsx"
mkdir -p src/components/monitoring

cat <<EOF > src/components/monitoring/VercelInsights.tsx
'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function VercelInsights() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
EOF

# 3. Inject into Layout
echo "3. Injecting into src/app/layout.tsx..."

# We use a temporary Node script for safe file manipulation
cat <<EOF > .inject-insights.js
const fs = require('fs');
const path = require('path');

const targetFile = path.join('src', 'app', 'layout.tsx');

if (!fs.existsSync(targetFile)) {
    console.error(' [!] Layout file not found at:', targetFile);
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// Check for existing injection
if (content.includes('VercelInsights')) {
    console.log(' [i] VercelInsights already setup.');
    process.exit(0);
}

// 1. Add Import
if (!content.includes('VercelInsights')) {
    content = "import { VercelInsights } from '@/components/monitoring/VercelInsights';\n" + content;
}

// 2. Add Component before </body>
if (content.includes('</body>')) {
    content = content.replace('</body>', '        <VercelInsights />\n      </body>');
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log(' [✓] Injected <VercelInsights /> successfully.');
} else {
    console.warn(' [!] Could not find </body> to inject component. Please add manually.');
}
EOF

# Run and cleanup
node .inject-insights.js
rm .inject-insights.js

# 4. Guide
echo "4. Generating Guide: VERCEL_INSIGHTS_GUIDE.md"
cat <<EOF > VERCEL_INSIGHTS_GUIDE.md
# Activasi Vercel Insights

1.  **Deploy**: Push kode terbaru ini ke GitHub/Vercel.
2.  **Dashboard**: Buka Dashboard Project di https://vercel.com.
3.  **Analytics**:
    *   Klik tab **Analytics**.
    *   Klik tombol **Enable**.
4.  **Speed Insights**:
    *   Klik tab **Speed Insights**.
    *   Klik tombol **Enable**.

Tunggu sekitar 15-30 menit setelah ada traffic, data akan muncul otomatis.
EOF

echo ""
echo "================================================="
echo "Setup Complete!"
echo "Read VERCEL_INSIGHTS_GUIDE.md for activation steps."
