#!/bin/bash

# =============================================================================
# Dead Code Analysis (Project Slimming & Cleanup)
# Uses 'knip' to find unused files, exports, and dependencies.
# =============================================================================

echo "Initializing Dead Code Audit..."
echo "================================================="

# 1. Install Knip
echo "1. Installing Knip..."
npm install --save-dev knip typescript

# 2. Configure Knip for Next.js App Router
echo "2. Generating knip.json configuration..."
cat <<EOF > knip.json
{
  "\$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "next.config.{js,ts,mjs}",
    "src/middleware.ts",
    "src/app/**/{page,layout,loading,error,not-found,global-error,route,template,default}.{ts,tsx}",
    "src/instrumentation.ts"
  ],
  "project": ["src/**/*.{ts,tsx,js,jsx}"],
  "ignore": ["**/*.d.ts"],
  "ignoreDependencies": [
    "eslint-config-next",
    "postcss",
    "autoprefixer",
    "tailwindcss",
    "sharp",
    "@types/*",
    "husky",
    "lint-staged",
    "prettier",
    "@vercel/*" 
  ]
}
EOF
# Added common dev tools to ignoreDependencies to reduce noise

# 3. Run Scan
echo "3. Scanning for dead code..."
echo "   NOTE: This tool is strict. Verify results before deleting."
echo "   Output also saved to DEAD_CODE_REPORT.txt"

npx knip --no-exit-code | tee DEAD_CODE_REPORT.txt

echo ""
echo "================================================="
echo "Audit Complete!"
echo "Check DEAD_CODE_REPORT.txt for the full list."
