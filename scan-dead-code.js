const fs = require('fs');
const path = require('path');

const DEAD_CODE_REPORT = 'DEAD_CODE_REPORT.md';
const DIRS_TO_SCAN = ['src/app', 'src/components', 'src/lib'];

console.log('Scanning for Dead Code (Commented out code)...\n');

let output = '# Dead Code Candidates\n\n';
output += 'This report lists potential dead code (commented out imports, variables, functions, etc.)\n\n';

let totalFound = 0;

DIRS_TO_SCAN.forEach(dir => {
    if (!fs.existsSync(dir)) {
        console.log(`   [!] Directory not found: ${dir}`);
        return;
    }

    output += `## ${dir}\n\n`;

    function scanDirectory(directory) {
        const files = fs.readdirSync(directory);

        files.forEach(file => {
            const fullPath = path.join(directory, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const lines = content.split('\n');

                const matches = [];
                lines.forEach((line, index) => {
                    // Check for commented code patterns
                    if (/^\s*\/\/\s*(import|const|let|var|function|console\.log|export|return|if|for|while)/.test(line)) {
                        matches.push({
                            lineNumber: index + 1,
                            content: line.trim()
                        });
                    }
                });

                if (matches.length > 0) {
                    const relativePath = path.relative(process.cwd(), fullPath);
                    output += `### ${relativePath}\n\n`;
                    matches.forEach(match => {
                        output += `- Line ${match.lineNumber}: \`${match.content}\`\n`;
                        totalFound++;
                    });
                    output += '\n';
                }
            }
        });
    }

    scanDirectory(dir);
});

output += `\n---\n**Total potential dead code lines found: ${totalFound}**\n`;

fs.writeFileSync(DEAD_CODE_REPORT, output);
console.log(`   [✓] Dead code report generated: ${DEAD_CODE_REPORT}`);
console.log(`   [i] Found ${totalFound} potential dead code lines\n`);
