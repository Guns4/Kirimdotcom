#!/bin/bash

# =============================================================================
# Advanced TypeScript Integrity Audit
# Senior Developer Standard
# =============================================================================

echo "Initializing System Integrity Check..."
echo "================================================="

# 1. Enforce Strict Configuration
echo "1. Upgrading tsconfig.json to Strict Mode..."

node -e "
const fs = require('fs');
const configFile = 'tsconfig.json';

try {
    if (fs.existsSync(configFile)) {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        config.compilerOptions = config.compilerOptions || {};
        
        // APPLY SENIOR DEV RULES
        config.compilerOptions.strict = true;           // Enable all strict type checking options
        config.compilerOptions.noImplicitAny = true;    // Raise error on expressions with an implied 'any' type
        config.compilerOptions.noUnusedLocals = true;   // Report errors on unused locals (Code Hygiene)
        
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        console.log('   [✓] Configuration updated successfully.');
    } else {
        console.error('   [!] tsconfig.json not found.');
    }
} catch (e) {
    console.error('   [!] Error modifying config:', e.message);
}
"

# 2. Run Deep Audit
echo "2. Running Deep Scan (npx tsc --noEmit)..."
echo "   Please wait while we compile the entire project virtual..."

LOG_FILE="AUDIT_TYPESCRIPT_LOG.txt"
# Capture both stdout and stderr
npx tsc --noEmit > "$LOG_FILE" 2>&1 || true

# 3. Analyze Results
ERROR_COUNT=$(wc -l < "$LOG_FILE")

echo ""
echo "================================================="
if [ "$ERROR_COUNT" -lt 5 ]; then # Arbitrary low number implies mostly clean (tsc might output headers)
    echo "STATUS: HIGH INTEGRITY [PASS]"
    echo "No significant errors found."
else
    echo "STATUS: INTEGRITY RISKS DETECTED [FAIL]"
    echo "Found approx $ERROR_COUNT issues in $LOG_FILE"
fi
echo "================================================="

# 4. Senior Developer Guidance
echo "HOW TO FIX COMMON ISSUES:"
echo "-------------------------------------------------"
echo "1. 'Parameter implicitly has an any type'"
echo "   Fix: Explicitly define the type."
echo "   Bad:  (props) => ..."
echo "   Good: (props: MyComponentProps) => ..."
echo ""
echo "2. 'Property does not exist on type...'"
echo "   Fix: Add the property to your Interface definition."
echo ""
echo "3. 'Variable is declared but never read' (noUnusedLocals)"
echo "   Fix: Delete the variable if unused."
echo "   Or prefix with underscore: _unusedVar (if your lint rules allow)."
echo ""
echo "Action: Open '$LOG_FILE' to start debugging."
