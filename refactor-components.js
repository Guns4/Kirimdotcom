/**
 * Code Maintenance & Refactoring Script
 * Analyzes and helps consolidate components
 */

const fs = require('fs');
const path = require('path');

const REPORT_FILE = 'REFACTOR_REPORT.md';
const COMPONENTS_DIR = 'src/components';
const UI_DIR = 'src/components/ui';

console.log('🔧 Starting Code Refactor Analysis...\n');

let report = `# Code Refactor Report\n`;
report += `Generated on: ${new Date().toLocaleString('id-ID')}\n\n`;

// ==========================
// 1. Analyze Loose Components
// ==========================
console.log('[1/4] Analyzing loose components in root...');
report += `## 📁 Loose Components in Root\n\n`;
report += `Components in \`src/components/\` root that could be moved to subfolders:\n\n`;
report += `| Component | Suggested Folder | Action |\n`;
report += `|-----------|------------------|--------|\n`;

let looseCount = 0;

try {
    const files = fs.readdirSync(COMPONENTS_DIR);
    for (const file of files) {
        const fullPath = path.join(COMPONENTS_DIR, file);
        const stat = fs.statSync(fullPath);

        if (!stat.isDirectory() && file.endsWith('.tsx')) {
            looseCount++;
            const name = file.replace('.tsx', '');

            // Suggest folder based on name
            let suggestedFolder = 'common';
            if (name.toLowerCase().includes('button') || name.toLowerCase().includes('input') || name.toLowerCase().includes('card')) {
                suggestedFolder = 'ui';
            } else if (name.toLowerCase().includes('nav') || name.toLowerCase().includes('header') || name.toLowerCase().includes('footer')) {
                suggestedFolder = 'navigation';
            } else if (name.toLowerCase().includes('modal') || name.toLowerCase().includes('dialog')) {
                suggestedFolder = 'modals';
            }

            report += `| \`${file}\` | \`${suggestedFolder}/\` | Move |\n`;
            console.log(`   [!] Loose: ${file} -> suggest: ${suggestedFolder}/`);
        }
    }
} catch (e) {
    console.log('   Error reading components dir');
}

report += `\n**Total loose components:** ${looseCount}\n\n`;

// ==========================
// 2. Find Duplicate Patterns
// ==========================
console.log('[2/4] Finding duplicate component patterns...');
report += `## 🔄 Potential Duplicates\n\n`;
report += `Components with similar names that might be consolidated:\n\n`;

const componentNames = new Map();

function scanForDuplicates(dir) {
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scanForDuplicates(fullPath);
            } else if (item.endsWith('.tsx')) {
                const baseName = item.replace('.tsx', '').toLowerCase();
                // Remove common suffixes to find similar names
                const cleanName = baseName
                    .replace(/wrapper|container|component|widget|section|card|modal|button/gi, '')
                    .trim();

                if (cleanName.length > 3) {
                    if (!componentNames.has(cleanName)) {
                        componentNames.set(cleanName, []);
                    }
                    componentNames.get(cleanName).push(fullPath);
                }
            }
        }
    } catch (e) { }
}

scanForDuplicates(COMPONENTS_DIR);

let duplicateCount = 0;
report += `| Base Pattern | Files | Action |\n`;
report += `|--------------|-------|--------|\n`;

for (const [pattern, files] of componentNames) {
    if (files.length > 1) {
        duplicateCount++;
        const fileList = files.map(f => path.basename(f)).join(', ');
        report += `| \`${pattern}\` | ${fileList} | Review & Consolidate |\n`;
    }
}

if (duplicateCount === 0) {
    report += `| - | - | ✅ No obvious duplicates |\n`;
}

report += `\n`;

// ==========================
// 3. Component Size Analysis
// ==========================
console.log('[3/4] Analyzing component sizes...');
report += `## 📏 Large Components (Candidates for Splitting)\n\n`;
report += `| Component | Lines | Suggestion |\n`;
report += `|-----------|-------|------------|\n`;

let largeCount = 0;

function analyzeSizes(dir) {
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                analyzeSizes(fullPath);
            } else if (item.endsWith('.tsx')) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const lines = content.split('\n').length;

                if (lines > 300) {
                    largeCount++;
                    const suggestion = lines > 500 ? 'Consider splitting into sub-components' : 'Consider extracting logic to hooks';
                    report += `| \`${fullPath.replace(/\\/g, '/')}\` | ${lines} | ${suggestion} |\n`;
                }
            }
        }
    } catch (e) { }
}

analyzeSizes(COMPONENTS_DIR);

if (largeCount === 0) {
    report += `| - | - | ✅ All components are reasonably sized |\n`;
}

report += `\n`;

// ==========================
// 4. Import Analysis
// ==========================
console.log('[4/4] Analyzing import patterns...');
report += `## 📦 Import Recommendations\n\n`;

// Check for barrel exports
const hasBarrelExport = fs.existsSync(path.join(COMPONENTS_DIR, 'index.ts')) ||
    fs.existsSync(path.join(COMPONENTS_DIR, 'index.tsx'));

if (!hasBarrelExport) {
    report += `> ⚠️ **Missing Barrel Export**: Consider creating \`src/components/index.ts\` for cleaner imports.\n\n`;
    report += `Example:\n`;
    report += `\`\`\`typescript\n`;
    report += `// src/components/index.ts\n`;
    report += `export * from './ui';\n`;
    report += `export * from './common';\n`;
    report += `export { TrackingCard } from './ui/TrackingCard';\n`;
    report += `\`\`\`\n\n`;
} else {
    report += `✅ Barrel export file exists.\n\n`;
}

// ==========================
// Summary
// ==========================
report += `## 📊 Summary\n\n`;
report += `- **Loose components in root:** ${looseCount}\n`;
report += `- **Potential duplicate patterns:** ${duplicateCount}\n`;
report += `- **Large components (>300 lines):** ${largeCount}\n`;
report += `- **Barrel export:** ${hasBarrelExport ? '✅ Exists' : '❌ Missing'}\n\n`;

report += `## 🛠️ Created Components\n\n`;
report += `- ✅ \`src/components/ui/TrackingCard.tsx\` - Unified tracking card with variants\n`;

// Save report
fs.writeFileSync(REPORT_FILE, report);

console.log(`\n✅ Refactor Analysis Complete!`);
console.log(`📄 Report saved to: ${REPORT_FILE}`);
console.log(`   - Loose components: ${looseCount}`);
console.log(`   - Duplicate patterns: ${duplicateCount}`);
console.log(`   - Large components: ${largeCount}`);
