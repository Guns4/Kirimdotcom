#!/bin/bash

# =============================================================================
# TypeScript Strictness Audit
# =============================================================================

echo "Starting Strict Type Audit..."
echo "================================================="

# 1. Update tsconfig.json (Safe JSON manipulation via Node)
echo "1. Enforcing Strict Mode in tsconfig.json..."
node -e "
try {
    const fs = require('fs');
    if (fs.existsSync('tsconfig.json')) {
        const config = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        config.compilerOptions = config.compilerOptions || {};
        
        // Enforce Rules
        config.compilerOptions.strict = true;
        config.compilerOptions.noImplicitAny = true;
        
        fs.writeFileSync('tsconfig.json', JSON.stringify(config, null, 2));
        console.log('   [OK] tsconfig.json updated: strict=true, noImplicitAny=true');
    } else {
        console.log('   [!] tsconfig.json not found.');
    }
} catch (e) {
    console.error('   [!] Failed to update tsconfig:', e.message);
}
"

# 2. Run Compiler Check
echo "2. Scanning codebase for type errors (tsc --noEmit)..."
echo "   This may take a moment..."

# Run tsc and redirect output. '|| true' ensures script continues even if tsc fails (finds errors)
npx tsc --noEmit > TYPE_ERRORS.log 2>&1 || true

ERROR_COUNT=$(wc -l < TYPE_ERRORS.log)
echo "   [!] Scan Complete. Found approx $ERROR_COUNT lines of output in TYPE_ERRORS.log."

# 3. Helper Guide
echo ""
echo "================================================="
echo "FIXING GUIDE: 'Implicit Any'"
echo "================================================="
echo "Problem: TypeScript infers 'any' because you didn't specify a type."
echo "Risk: 'any' disables type checking, leading to runtime crashes."
echo ""
echo "HOW TO FIX:"
echo "-------------------------------------------------"
echo "1. Function Arguments"
echo "   BAD:  function greet(name) { ... }"
echo "   GOOD: function greet(name: string) { ... }"
echo ""
echo "2. Objects / API Responses"
echo "   BAD:  const data = await res.json();"
echo "   GOOD: "
echo "         interface User { id: string; name: string }"
echo "         const data: User = await res.json();"
echo ""
echo "3. Event Handlers (React)"
echo "   BAD:  onChange={(e) => setValue(e.target.value)}"
echo "   GOOD: onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}"
echo ""
echo "NEXT STEPS:"
echo "1. Open 'TYPE_ERRORS.log'."
echo "2. Fix errors file by file."
echo "3. Re-run this script until log is empty."
