#!/bin/bash

# =============================================================================
# Vercel Edge Runtime Migration Assistant
# =============================================================================

echo "Starting Edge Migration Analysis..."
echo "================================================="

TARGET_DIR="src/app/api"
REPORT_FILE="EDGE_MIGRATION_REPORT.md"

echo "# Edge Migration Candidates" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# List of Node.js specific modules to watch out for
NODE_MODULES="fs|path|child_process|os|net|tls|crypto"
# Heavy libraries to replace
HEAVY_LIBS="axios|lodash|moment"

count=0

find "$TARGET_DIR" -type f -name "route.ts" | while read file; do
    # Check if already edge
    if grep -q "runtime = 'edge'" "$file"; then
        continue
    fi

    echo "Analyzing: $file"
    
    # 1. Check for Node.js modules
    NODE_IMPORTS=$(grep -E "import.*($NODE_MODULES)" "$file")
    
    # 2. Check for Heavy Libs
    HEAVY_IMPORTS=$(grep -E "import.*($HEAVY_LIBS)" "$file")

    if [ -n "$NODE_IMPORTS" ]; then
        echo "   [X] Cannot auto-migrate: Uses Node.js modules."
        echo "       $NODE_IMPORTS"
        continue
    fi

    # 3. Warning for Heavy Libs
    WARNING=""
    if [ -n "$HEAVY_IMPORTS" ]; then
        WARNING="⚠️  Has heavy libs (Consider replacing with native Fetch/Date)"
    fi

    echo "   [✓] Candidate for Edge!"
    
    # Append to Report
    echo "## $file" >> "$REPORT_FILE"
    echo "- Status: **Ready to Migrate**" >> "$REPORT_FILE"
    if [ -n "$WARNING" ]; then
        echo "- Warning: $WARNING" >> "$REPORT_FILE"
        echo "- Detected: \`$HEAVY_IMPORTS\`" >> "$REPORT_FILE"
    fi
    echo "" >> "$REPORT_FILE"

    # 4. OPTIONAL: Auto-Apply (Commented out for safety, user can uncomment)
    # echo "export const runtime = 'edge';" >> "$file"
    # echo "   -> Added runtime config."
    
    ((count++))
done

echo ""
echo "================================================="
echo "Analysis Complete!"
echo "Found potential candidates. Check $REPORT_FILE."
echo ""
echo "TO APPLY MIGRATION MANUALLY:"
echo "1. Open the file."
echo "2. Add: export const runtime = 'edge';"
echo "3. Replace 'axios' with 'fetch'."
