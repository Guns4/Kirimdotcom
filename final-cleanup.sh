#!/bin/bash

# =============================================================================
# Final Codebase Cleanup & Optimization (Golden Master Prep)
# =============================================================================

echo "Starting Final Cleanup..."
echo "================================================="

# 1. Strip Console Logs (Production Build)
echo "1. Configuring Next.js to strip console.log in production..."
CONFIG_FILE="next.config.mjs"

# Check if removeConsole is already configured
if grep -q "removeConsole" "$CONFIG_FILE"; then
    echo "   [OK] removeConsole already present in $CONFIG_FILE"
else
    echo "   [UPDATE] Adding removeConsole config to $CONFIG_FILE..."
    # Warning: simple regex replacement. 
    # Logic: Find 'const nextConfig = {' and insert the compiler option after it.
    
    # We create a temporary node script to safely modify the config structure if possible, 
    # or just create a new snippet if it's standard.
    # Given the complexity of regexing JS, we will append a manual instruction or try a safe insertion.
    
    # Safe fallback: We won't break the build file with sed. We'll check and advise.
    echo "   ----------------------------------------------------------------"
    echo "   Please manually ensure your '$CONFIG_FILE' has:"
    echo "   compiler: {"
    echo "       removeConsole: process.env.NODE_ENV === 'production',"
    echo "   }"
    echo "   ----------------------------------------------------------------"
fi

# 2. Lint & Optimize Imports
echo "2. Running Linter (Fix Mode)..."
echo "   Sorting imports and removing unused variables (if rules enabled)..."
npm run lint -- --fix || echo "   [!] Lint found issues that auto-fix couldn't resolve."

# 3. Detect Dead Code (Comments)
echo "3. Scanning for Dead Code (Commented out code)..."
DEAD_CODE_REPORT="DEAD_CODE_REPORT.md"
echo "# Dead Code Candidates" > "$DEAD_CODE_REPORT"
echo "" >> "$DEAD_CODE_REPORT"

# Heuristic: Lines starting with // that look like code
# e.g., // const, // import, // function, // console.log
grep -r -n -E "^[[:space:]]*//[[:space:]]*(import|const|let|var|function|console\.log)" src/app src/components src/lib >> "$DEAD_CODE_REPORT"

echo "   [?] Dead code report generated: $DEAD_CODE_REPORT"

# 4. Final Sanity Check
echo "4. Checking for lingering console.logs in source..."
LOG_COUNT=$(grep -r "console.log" src | wc -l)
if [ "$LOG_COUNT" -gt 0 ]; then
    echo "   [i] Found $LOG_COUNT active console.log statements."
    echo "       (These will be stripped in prod build if step 1 is done)"
else
    echo "   [✓] Source is clean of console.logs!"
fi

echo ""
echo "================================================="
echo "Cleanup Run Complete!"
echo "1. Check $DEAD_CODE_REPORT to remove commented-out code manually."
echo "2. Verify next.config.mjs includes removeConsole."
echo "3. Run 'npm run build' to test the Golden Master build."
