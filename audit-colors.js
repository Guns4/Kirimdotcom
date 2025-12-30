const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'src';
const REPORT_FILE = 'COLOR_AUDIT.md';

const BANNED_PATTERNS = [
    { regex: /#[0-9a-fA-F]{3,6}\b/g, label: 'Hex Code' },
    { regex: /\bbg-white\b/g, label: 'bg-white (Use bg-background/card)' },
    { regex: /\bbg-black\b/g, label: 'bg-black (Use bg-foreground?)' },
    { regex: /\btext-white\b/g, label: 'text-white (Use text-primary-foreground?)' },
    { regex: /\btext-black\b/g, label: 'text-black (Use text-foreground)' },
    { regex: /\b(text|bg)-gray-[0-9]{2,3}\b/g, label: 'Hardcoded Gray (Use muted/card)' },
    { regex: /\b(text|bg)-slate-[0-9]{2,3}\b/g, label: 'Hardcoded Slate' },
    { regex: /\b(text|bg)-zinc-[0-9]{2,3}\b/g, label: 'Hardcoded Zinc' }
];

// Files to exclude
const EXCLUDES = ['globals.css', 'tailwind.config.ts', 'tailwind.config.mjs'];

function scanDir(dir, report = {}) {
    if (!fs.existsSync(dir)) return report;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, report);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            if (EXCLUDES.includes(file)) return;

            const content = fs.readFileSync(fullPath, 'utf8');
            let fileIssues = [];

            BANNED_PATTERNS.forEach(pattern => {
                const matches = content.match(pattern.regex);
                if (matches) {
                    // Unique matches only
                    const unique = [...new Set(matches)];
                    fileIssues.push({ type: pattern.label, count: matches.length, samples: unique.slice(0, 3) });
                }
            });

            if (fileIssues.length > 0) {
                report[fullPath] = fileIssues;
            }
        }
    });
    return report;
}

const results = scanDir(TARGET_DIR);
let mdOutput = '# Visual Consistency Audit Report\n\n';
mdOutput += 'This report lists files containing hardcoded colors (Hex) or non-semantic Tailwind classes.\n';
mdOutput += '**Goal:** Replace these with semantic variables (`bg-background`, `text-muted-foreground`, etc.) for perfect Dark Mode support.\n\n';

if (Object.keys(results).length === 0) {
    mdOutput += '✅ **Clean!** No hardcoded colors found in audited files.\n';
    console.log('   [✅] No hardcoded colors found!');
} else {
    mdOutput += '| File | Issues Found | Samples |\n';
    mdOutput += '|------|--------------|---------|\\n';

    Object.keys(results).forEach(filepath => {
        const issues = results[filepath];
        if (issues.length > 0) {
            const relativePath = path.relative(process.cwd(), filepath);
            const issueSummary = issues.map(i => `**${i.type}** (${i.count})`).join('<br>');
            const samples = issues.map(i => i.samples.map(s => `\`${s}\``).join(' ')).join('<br>');

            mdOutput += `| \`${relativePath}\` | ${issueSummary} | ${samples} |\n`;
            console.log(`   [!] Found issues in: ${relativePath}`);
        }
    });
}

// Add Instructions Footer
mdOutput += '\n## How to Fix\n';
mdOutput += '1. **Hex Codes**: Move to `tailwind.config.ts` or use closest semantic variable.\n';
mdOutput += '2. **bg-white**: Replace with `bg-background` (Page) or `bg-card` (Component).\n';
mdOutput += '3. **text-gray-***: Replace with `text-muted-foreground`.\n';
mdOutput += '4. **text-black**: Replace with `text-foreground`.\n';

fs.writeFileSync(REPORT_FILE, mdOutput);
console.log('\n   [i] Report generated at ' + REPORT_FILE);
console.log('   [i] Total files with issues: ' + Object.keys(results).length);
