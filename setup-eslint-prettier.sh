#!/bin/bash

# =============================================================================
# Code Consistency: ESLint & Prettier Auto-Fix Setup
# =============================================================================

echo "Initializing Code Consistency Tools..."
echo "================================================="

# 1. Install Dependencies
echo "1. Installing ESLint & Prettier packages..."
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier eslint-config-next

# 2. Configure ESLint
echo "2. Generating .eslintrc.json..."
cat <<EOF > .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "react/no-unescaped-entities": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
EOF

# 2b. Configure Prettier (Optional but good practice)
cat <<EOF > .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100
}
EOF

# 3. Add Script to package.json
echo "3. Adding 'lint:fix' command to package.json..."
node -e "
const fs = require('fs');
const pkgFile = 'package.json';
try {
    if (fs.existsSync(pkgFile)) {
        const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
        pkg.scripts = pkg.scripts || {};
        
        // Add the magic command
        pkg.scripts['lint:fix'] = 'next lint --fix && prettier --write \"src/**/*.{js,jsx,ts,tsx,css,md}\"';
        
        fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
        console.log('   [✓] package.json updated with lint:fix script.');
    } else {
        console.error('   [!] package.json not found.');
    }
} catch (e) {
    console.error('   [!] Error updating package.json:', e.message);
}
"

# 4. Execute Immediate Fix
echo "4. Running Auto-Format on the entire project..."
echo "   Please wait while we prettify your code..."

npm run lint:fix

echo ""
echo "================================================="
echo "Setup Complete & Code Formatted!"
echo "Future Usage: Run 'npm run lint:fix' anytime to clean your code."
