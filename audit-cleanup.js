/**
 * Project Cleanup & Audit Script
 * Analyzes unused dependencies and orphan files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORT_FILE = 'CLEANUP_REPORT.md';
const SRC_DIR = 'src';

console.log('🧹 Starting Project Cleanup Audit...\n');

let report = `# Project Cleanup Report\n`;
report += `Generated on: ${new Date().toLocaleString('id-ID')}\n\n`;

// ==========================
// 1. Check Unused Dependencies
// ==========================
console.log('1. Analyzing Dependencies (depcheck)...');
report += `## 📦 Unused Dependencies\n\n`;

try {
    const depcheckResult = execSync('npx depcheck --json 2>&1', {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
    });

    const depcheck = JSON.parse(depcheckResult);

    if (depcheck.dependencies && depcheck.dependencies.length > 0) {
        report += `### Unused Dependencies\n`;
        report += `These packages are installed but not imported anywhere:\n\n`;
        report += `| Package | Suggested Action |\n`;
        report += `|---------|------------------|\n`;
        depcheck.dependencies.forEach(dep => {
            report += `| \`${dep}\` | \`npm uninstall ${dep}\` |\n`;
        });
        report += `\n`;
    } else {
        report += `✅ No unused dependencies found!\n\n`;
    }

    if (depcheck.devDependencies && depcheck.devDependencies.length > 0) {
        report += `### Unused Dev Dependencies\n`;
        report += `| Package | Suggested Action |\n`;
        report += `|---------|------------------|\n`;
        depcheck.devDependencies.forEach(dep => {
            report += `| \`${dep}\` | \`npm uninstall -D ${dep}\` |\n`;
        });
        report += `\n`;
    }

    if (depcheck.missing && Object.keys(depcheck.missing).length > 0) {
        report += `### ⚠️ Missing Dependencies\n`;
        report += `These are imported but not in package.json:\n\n`;
        Object.keys(depcheck.missing).forEach(dep => {
            report += `- \`${dep}\` - used in: ${depcheck.missing[dep].slice(0, 2).join(', ')}...\n`;
        });
        report += `\n`;
    }

    console.log('   ✅ Dependency analysis complete');
} catch (error) {
    report += `\`\`\`\nDepcheck could not be run. Error: ${error.message}\n\`\`\`\n\n`;
    console.log('   ⚠️ Depcheck failed (may need to install: npm i -g depcheck)');
}

// ==========================
// 2. Find Orphan Files
// ==========================
console.log('2. Analyzing Orphan Files (unused components)...');
report += `## 🗑️ Potential Orphan Files\n\n`;
report += `Files that appear to be unreferenced. **Verify manually before deleting.**\n\n`;
report += `| File Path | Type | Suggested Action |\n`;
report += `|-----------|------|------------------|\n`;

// Next.js special files to skip
const SKIP_NAMES = [
    'page', 'layout', 'loading', 'error', 'not-found', 'global-error',
    'route', 'template', 'default', 'icon', 'sitemap', 'robots',
    'opengraph-image', 'twitter-image', 'middleware', 'index'
];

// Folders to search for references
const SEARCH_DIRS = ['src/app', 'src/components', 'src/lib', 'src/hooks', 'src/utils', 'src/context'];

let orphanCount = 0;

function getAllFiles(dir, extensions) {
    let files = [];
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                files = files.concat(getAllFiles(fullPath, extensions));
            } else if (extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    } catch (e) { }
    return files;
}

function searchForUsage(name, excludeFile) {
    for (const searchDir of SEARCH_DIRS) {
        if (!fs.existsSync(searchDir)) continue;

        const files = getAllFiles(searchDir, ['.ts', '.tsx', '.js', '.jsx']);
        for (const file of files) {
            if (file === excludeFile) continue;

            try {
                const content = fs.readFileSync(file, 'utf-8');
                // Search for import statements or usage
                if (content.includes(`'${name}'`) ||
                    content.includes(`"${name}"`) ||
                    content.includes(`/${name}`) ||
                    content.includes(` ${name}`) ||
                    content.includes(`<${name}`)) {
                    return true;
                }
            } catch (e) { }
        }
    }
    return false;
}

// Get all TypeScript/TSX files
const allFiles = getAllFiles(SRC_DIR, ['.ts', '.tsx']);

for (const file of allFiles) {
    const basename = path.basename(file);
    const nameWithoutExt = basename.replace(/\.(tsx?|jsx?)$/, '');

    // Skip Next.js special files
    if (SKIP_NAMES.includes(nameWithoutExt)) continue;

    // Skip i18n related
    if (file.includes('i18n') || file.includes('messages')) continue;

    // Search for usage
    const isUsed = searchForUsage(nameWithoutExt, file);

    if (!isUsed) {
        const type = file.includes('/components/') ? 'Component' :
            file.includes('/hooks/') ? 'Hook' :
                file.includes('/lib/') ? 'Lib' :
                    file.includes('/utils/') ? 'Util' :
                        file.includes('/actions/') ? 'Action' : 'Other';

        report += `| \`${file.replace(/\\/g, '/')}\` | ${type} | ⚠️ Check & Delete |\n`;
        orphanCount++;
        console.log(`   [!] Potential orphan: ${file}`);
    }
}

if (orphanCount === 0) {
    report += `| - | - | ✅ No orphans found |\n`;
}

report += `\n**Total potential orphans:** ${orphanCount}\n\n`;

// ==========================
// 3. Large Files Analysis
// ==========================
console.log('3. Analyzing Large Files...');
report += `## 📏 Large Files (>500 lines)\n\n`;
report += `| File Path | Lines | Suggested Action |\n`;
report += `|-----------|-------|------------------|\n`;

let largeFileCount = 0;

for (const file of allFiles) {
    try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').length;

        if (lines > 500) {
            report += `| \`${file.replace(/\\/g, '/')}\` | ${lines} | Consider splitting |\n`;
            largeFileCount++;
        }
    } catch (e) { }
}

if (largeFileCount === 0) {
    report += `| - | - | ✅ No large files found |\n`;
}

// ==========================
// Summary
// ==========================
report += `\n## 📊 Summary\n\n`;
report += `- **Potential orphan files:** ${orphanCount}\n`;
report += `- **Large files (>500 lines):** ${largeFileCount}\n`;
report += `- **Report generated:** ${new Date().toISOString()}\n`;

// Save report
fs.writeFileSync(REPORT_FILE, report);

console.log(`\n✅ Audit Complete!`);
console.log(`📄 Report saved to: ${REPORT_FILE}`);
console.log(`   - Orphan files: ${orphanCount}`);
console.log(`   - Large files: ${largeFileCount}`);
