#!/bin/bash

# =============================================================================
# Git Commit Protection Service (Husky + Lint-Staged)
# =============================================================================

echo "Initializing Prevention Guard..."
echo "================================================="

# 1. Install Dependencies
echo "1. Installing Husky & Lint-Staged..."
npm install --save-dev husky lint-staged

# 2. Initialize Husky
echo "2. Initializing Husky..."
# This command sets up the .husky folder and adds the "prepare" script to package.json
npx husky init

# 3. Configure Lint-Staged (in package.json)
echo "3. Configuring lint-staged..."
# We use node to safely inject the config into package.json
node -e "
const fs = require('fs');
const pkgFile = 'package.json';
try {
    if (fs.existsSync(pkgFile)) {
        const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
        
        // Define lint-staged rules
        pkg['lint-staged'] = {
            '*.{js,jsx,ts,tsx}': [
                'eslint --fix',
                'prettier --write'
            ],
            '*.{json,css,md}': [
                'prettier --write'
            ]
        };
        
        fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
        console.log('   [✓] package.json updated with lint-staged config.');
    }
} catch (e) {
    console.error('   [!] Error updating package.json:', e.message);
}
"

# 4. Create Pre-Commit Hook
echo "4. Creating Pre-Commit Hook (.husky/pre-commit)..."
cat <<EOF > .husky/pre-commit
#!/bin/sh
. "\$(dirname "\$0")/_/husky.sh"

echo "🛡️  GUARD: Checking code before commit..."

# 1. Run Lint-Staged (Format & Lint staged files)
echo "   [1/2] Running Lint-Staged..."
npx lint-staged
if [ \$? -ne 0 ]; then
    echo "   ❌ Linting Failed! Auto-fix couldn't resolve everything."
    echo "      Please fix the errors above."
    exit 1
fi

# 2. Run TypeScript Check (Whole Project)
# Note: tsc cannot really run on 'staged only' files easily without complex setup.
# Running on whole project ensures integrity.
echo "   [2/2] Checking Types (tsc)..."
npx tsc --noEmit
if [ \$? -ne 0 ]; then
    echo "   ❌ Type Check Failed!"
    echo "      \033[0;31mFIX ERROR FIRST!\033[0m" # Red Text
    exit 1
fi

echo "   ✅ Code is clean. Committing..."
EOF

chmod +x .husky/pre-commit

echo ""
echo "================================================="
echo "Setup Complete!"
echo "Try making a dummy commit. If your code uses 'any' or has syntax errors,"
echo "the commit will be BLOCKED automatically."
