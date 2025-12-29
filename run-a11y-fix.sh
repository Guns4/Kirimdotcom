#!/bin/bash

# =============================================================================
# Accessibility (a11y) Compliance Audit
# WCAG 2.1 Checker
# =============================================================================

REPORT_FILE="A11Y_REPORT.md"
echo "# Accessibility Audit Report" > "$REPORT_FILE"
echo "Generated on: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Starting Accessibility Audit..."
echo "================================================="

# 1. Check for Buttons without Labels (Icon-only buttons)
echo "1. Scanning for Unlabeled Buttons..."
echo "## 1. Missing Aria-Labels on Buttons" >> "$REPORT_FILE"
echo "Buttons that appear to be icon-only (contain icons) but miss 'aria-label' or text content." >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

# Regex Explanation:
# Look for <button or <Button
# That contains <[A-Z] (likely an icon component)
# But DOES NOT contain aria-label=
# This is a heuristic and might return false positives/negatives.
grep -r -n -E "<(button|Button)" src/components | while read line; do
    file=$(echo "$line" | cut -d: -f1)
    lineno=$(echo "$line" | cut -d: -f2)
    content=$(echo "$line" | cut -d: -f3-)

    # Check if it has aria-label
    if [[ "$content" != *"aria-label"* ]]; then
        # Check if it seems to rely on icons (e.g., contains specialized Icon names or svg)
        # Assuming common icon names like 'Icon', 'User', 'Menu', 'Search', 'Trash' etc or just title case imports
        if [[ "$content" != *">"* ]] || [[ "$content" == *"/>"* ]]; then 
             # It's a self-closing button or complex one. 
             # Skip simple analysis for now, focus on clear cases.
             :
        fi
        
        # Simple check: <button className="..."> <Icon /> </button> type structure is hard to grep line-by-line.
        # We will look for explicit icon usage same line or usage of 'icon' prop.
        if [[ "$content" == *"icon="* ]] || [[ "$content" == *"Icon"* ]]; then
             echo "$file:$lineno -> $content" >> "$REPORT_FILE"
        fi
    fi
done
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"


# 2. Color Contrast Check (Tailwind)
echo "2. Checking for Low Contrast Text..."
echo "## 2. Low Contrast Text Warnings" >> "$REPORT_FILE"
echo "Text that might be too light (e.g., gray-300, gray-400 on white). Aim for gray-600+ for body text." >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

# Look for text-gray-100 to text-gray-400 (often too light for small text on white)
# Also text-slate-*, text-zinc-*
grep -r -n -E "text-(gray|slate|zinc)-(100|200|300|400)" src/components | head -n 20 >> "$REPORT_FILE"
echo "... (truncated)" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"


# 3. Focus Management (Outline None)
echo "3. Checking Focus Indicators..."
echo "## 3. Focus Indicator Suppression" >> "$REPORT_FILE"
echo "Elements using 'outline-none' usually need 'focus-visible:ring' or similar to be accessible." >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

grep -r -n "outline-none" src/components | while read line; do
    # Check if the same line has a focus fix
    if [[ "$line" != *"focus:"* ]] && [[ "$line" != *"ring"* ]]; then
        echo "$line" >> "$REPORT_FILE"
    fi
done
echo "\`\`\`" >> "$REPORT_FILE"

echo ""
echo "================================================="
echo "Audit Complete! Check $REPORT_FILE for potential issues."
echo "Suggested Fixes:"
echo "1. Add aria-label=\"Description\" to icon buttons."
echo "2. Darken text colors to text-gray-500 or higher."
echo "3. Ensure outline-none is paired with focus-visible:ring-2."
