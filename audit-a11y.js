const fs = require('fs');
const path = require('path');

const REPORT_FILE = 'A11Y_REPORT.md';
const SCAN_DIR = 'src/components';

console.log('Starting Accessibility Audit...');
console.log('=================================================\n');

let output = '# Accessibility Audit Report\n\n';
output += `Generated on: ${new Date().toLocaleString()}\n\n`;
output += 'This report identifies potential WCAG 2.1 compliance issues.\n\n';

// Counters
let unlabeledButtons = 0;
let lowContrastText = 0;
let focusIssues = 0;

// 1. Check for Buttons without Labels
console.log('1. Scanning for Unlabeled Buttons...');
output += '## 1. Missing Aria-Labels on Buttons\n\n';
output += 'Buttons that appear to be icon-only but miss `aria-label` or visible text.\n\n';

function scanForUnlabeledButtons(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanForUnlabeledButtons(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // Look for button tags with icons but no aria-label
                if (/<(button|Button)/.test(line) && /Icon|svg/.test(line) && !/aria-label/.test(line)) {
                    const relativePath = path.relative(process.cwd(), fullPath);
                    output += `- \`${relativePath}:${index + 1}\`\n  \`\`\`tsx\n  ${line.trim()}\n  \`\`\`\n\n`;
                    unlabeledButtons++;
                }
            });
        }
    });
}

scanForUnlabeledButtons(SCAN_DIR);
if (unlabeledButtons === 0) {
    output += '_No obvious issues found._\n\n';
}

// 2. Color Contrast Check
console.log('2. Checking for Low Contrast Text...');
output += '## 2. Low Contrast Text Warnings\n\n';
output += 'Text using light colors (gray-100 to gray-400) which may not meet WCAG AA standards.\n\n';

function scanForLowContrast(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanForLowContrast(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // Look for light text colors
                if (/text-(gray|slate|zinc)-(100|200|300|400)/.test(line)) {
                    const relativePath = path.relative(process.cwd(), fullPath);
                    if (lowContrastText < 20) { // Limit output
                        output += `- \`${relativePath}:${index + 1}\` - ${line.trim().substring(0, 80)}...\n`;
                    }
                    lowContrastText++;
                }
            });
        }
    });
}

scanForLowContrast(SCAN_DIR);
if (lowContrastText === 0) {
    output += '_No obvious issues found._\n\n';
} else {
    output += `\n_Total: ${lowContrastText} instances found (showing first 20)_\n\n`;
}

// 3. Focus Management
console.log('3. Checking Focus Indicators...');
output += '## 3. Focus Indicator Suppression\n\n';
output += 'Elements using `outline-none` without proper `focus-visible:ring` alternatives.\n\n';

function scanForFocusIssues(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanForFocusIssues(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // Look for outline-none without focus replacement
                if (/outline-none/.test(line) && !/focus:|ring/.test(line)) {
                    const relativePath = path.relative(process.cwd(), fullPath);
                    if (focusIssues < 20) { // Limit output
                        output += `- \`${relativePath}:${index + 1}\` - ${line.trim().substring(0, 80)}...\n`;
                    }
                    focusIssues++;
                }
            });
        }
    });
}

scanForFocusIssues(SCAN_DIR);
if (focusIssues === 0) {
    output += '_No obvious issues found._\n\n';
} else {
    output += `\n_Total: ${focusIssues} instances found (showing first 20)_\n\n`;
}

// Summary
output += '## Summary\n\n';
output += `- **Unlabeled Buttons**: ${unlabeledButtons}\n`;
output += `- **Low Contrast Text**: ${lowContrastText}\n`;
output += `- **Focus Issues**: ${focusIssues}\n\n`;

output += '## Recommended Fixes\n\n';
output += '1. **Aria-labels**: Add `aria-label="Description"` to all icon-only buttons\n';
output += '2. **Contrast**: Use `text-gray-500` or darker for body text (WCAG AA: 4.5:1)\n';
output += '3. **Focus**: Pair `outline-none` with `focus-visible:ring-2 focus-visible:ring-primary-500`\n\n';

output += '## Resources\n\n';
output += '- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)\n';
output += '- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)\n';
output += '- [MDN ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)\n';

fs.writeFileSync(REPORT_FILE, output);

console.log('\n=================================================');
console.log(`Audit Complete! Report saved to ${REPORT_FILE}`);
console.log(`\nResults:`);
console.log(`  - Unlabeled Buttons: ${unlabeledButtons}`);
console.log(`  - Low Contrast Text: ${lowContrastText}`);
console.log(`  - Focus Issues: ${focusIssues}`);
console.log('\nSuggested Fixes:');
console.log('1. Add aria-label="Description" to icon buttons.');
console.log('2. Darken text colors to text-gray-500 or higher.');
console.log('3. Ensure outline-none is paired with focus-visible:ring-2.\n');
