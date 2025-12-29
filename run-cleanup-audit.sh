#!/bin/bash

# =============================================================================
# Clean & Audit Script
# =============================================================================

REPORT_FILE="CLEANUP_REPORT.md"

echo "# Project Cleanup Report" > "$REPORT_FILE"
echo "Generated on: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Starting Audit..."
echo "1. Analyzing Dependencies (depcheck)..."

# 1. Depcheck (Check unused dependencies)
echo "## Unused Dependencies" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
# Check if depcheck is available, else use npx
if command -v depcheck &> /dev/null; then
    depcheck >> "$REPORT_FILE" 2>&1
else
    echo "Running npx depcheck (this may take a moment)..."
    npx depcheck --skip-missing=true --ignore-bin-package=true >> "$REPORT_FILE" 2>&1
fi
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 2. Find Orphan Files (Bash Heuristic)
echo "2. Analyzing Orphan Files (Unused .ts/.tsx)..."
echo "## Potential Orphan Files" >> "$REPORT_FILE"
echo "The following files seem to be unreferenced (heuristic search). **Verify manually before deleting.**" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| File Path | Suggested Action |" >> "$REPORT_FILE"
echo "|-----------|------------------|" >> "$REPORT_FILE"

# Find all ts/tsx files in src
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
    filename=$(basename "$file")
    name="${filename%.*}" # Remove extension

    # 1. Skip Next.js Routing & Special Files
    if [[ "$name" =~ ^(page|layout|loading|error|not-found|global-error|route|template|default|icon|sitemap|robots|opengraph-image|twitter-image)$ ]]; then
        continue
    fi

    # 2. Skip Configuration / Root files
    if [[ "$file" == *"middleware.ts"* ]] || [[ "$file" == *"i18n.ts"* ]]; then
        continue
    fi
    
    # 3. Skip 'index' files (usually barrel files, explicitly imported by folder name)
    if [[ "$name" == "index" ]]; then
        continue
    fi

    # 4. Search for usage
    # We search for the *filename without extension* in all src files
    # Exclude the file itself from the search
    # -r: recursive
    # -q: quiet (exit 0 if found)
    # --exclude: don't look inside the file itself (though we pipe find, grep -r scan dir)
    # Actually, exclude flag on grep refers to file *matches*, not excluding it from search path if passed via dir.
    # We use simple grep on src folder.
    
    # Search for "ComponentName" or "fileName" (simple heuristic)
    if ! grep -r -q --exclude="$filename" "$name" src/app src/components src/lib src/hooks src/utils src/context 2>/dev/null; then
        echo "| \`$file\` | 🗑️ Check & Delete |" >> "$REPORT_FILE"
        echo "   [!] Potential orphan: $file"
    fi
done

echo ""
echo "Audit Complete! Check $REPORT_FILE for details."
echo "================================================="
echo "Report saved to: $REPORT_FILE"
