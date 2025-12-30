#!/bin/bash

# =============================================================================
# Code Consistency & Formatting Automation (ESLint + Prettier)
# =============================================================================

echo "Starting Code Consistency Audit..."
echo "================================================="

# 1. Install Dependencies
echo "1. Installing ESLint plugins & Prettier..."
# checks if packages are missing and installs them
npm install --save-dev prettier eslint-config-prettier eslint-plugin-react-hooks

# 2. Configure ESLint (Strict + Prettier Compatible)
echo "2. Generating strict .eslintrc.json..."
cat <<EOF > .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier" 
  ],
  "plugins": [
    "react-hooks"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "off", 
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
EOF
echo "   [?] .eslintrc.json configured."

# 3. Configure Prettier (Optional but recommended)
echo "2b. Generating .prettierrc..."
cat <<EOF > .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# 4. Auto-Fix Code
echo "3. Running Auto-Fix (Linting & Formatting)..."
echo "   This will automatically fix indentation, spacing, and simple errors."

# Run lint fix
if npm run lint -- --fix; then
    echo "   [?] Linting Complete. Code is clean."
else
    echo "   [!] Linting finished with some manual errors remaining."
fi

# Run prettier write (if not fully covered by lint)
# Quotes around glob crucial in bash to prevent shell expansion before npx
npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,md}"

echo ""
echo "================================================="
echo "Audit Complete!"
echo "Your code should now be formatted and consistent."
