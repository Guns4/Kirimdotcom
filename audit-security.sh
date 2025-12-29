#!/bin/bash

echo "=========================================="
echo "🛡️  Starting Security Audit..."
echo "=========================================="

REPORT_FILE="SECURITY_REPORT.md"

# 1. Audit
echo "1. Scanning for High/Critical Vulnerabilities..."
echo "# Security Audit Report" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## NPM Audit Output" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

# Run audit, append to file. We use || true because npm audit returns non-zero if vulnerabilities are found.
npm audit --audit-level=high >> "$REPORT_FILE" 2>&1 || true

echo "\`\`\`" >> "$REPORT_FILE"
echo "   [✓] Audit complete. Report saved to $REPORT_FILE"

# 2. Auto Fix
echo "2. Attempting Auto-Fix (safe updates only)..."
npm audit fix

echo "=========================================="
echo "✅ Security Check Process Completed."
echo "   Please review $REPORT_FILE for any remaining issues."
