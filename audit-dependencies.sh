#!/bin/bash

# =============================================================================
# Dependency Security Audit
# =============================================================================

echo "Starting Security Audit..."
echo "================================================="

# 1. Automatic Fix
echo "1. Attempting to auto-fix vulnerabilities..."
# 'npm audit fix' updates compatible versions to patch vulnerabilities
npm audit fix

echo "   [i] Auto-fix attempt complete."
echo ""

# 2. Critical Scan
echo "2. Scanning for remaining High/Critical issues..."
REPORT_FILE="SECURITY_REPORT.txt"

# --audit-level=high makes the command exit with error if high/critical issues found
# capturing stdout and stderr to the report file
npm audit --audit-level=high > "$REPORT_FILE" 2>&1
EXIT_CODE=$?

# 3. Analyze Result
if [ $EXIT_CODE -eq 0 ]; then
    echo "   [✓] SUCCESS: No High or Critical vulnerabilities found."
    echo "       (You can inspect $REPORT_FILE to be sure)"
else
    echo "   [!] WARNING: Validated High/Critical vulnerabilities detected!"
    echo "       These could not be automatically fixed."
    echo ""
    echo "   Action Required:"
    echo "   1. Open '$REPORT_FILE' to identify the vulnerable packages."
    echo "   2. Manually update them (e.g., 'npm install package@latest')."
    echo "   3. If a direct dependency is fine but a nested one is not,"
    echo "      try 'npm update' or check GitHub issues for that package."
fi

echo ""
echo "================================================="
echo "Report saved to: $REPORT_FILE"
