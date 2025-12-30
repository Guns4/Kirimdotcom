const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'src/app/api';
const REPORT_FILE = 'EDGE_MIGRATION_REPORT.md';

console.log('Starting Edge Migration Analysis...');
console.log('=================================================\n');

// Node.js specific modules that prevent edge runtime
const NODE_MODULES = ['fs', 'path', 'child_process', 'os', 'net', 'tls', 'crypto'];
// Heavy libraries that should be replaced
const HEAVY_LIBS = ['axios', 'lodash', 'moment'];

let output = '# Edge Runtime Migration Report\n\n';
output += 'This report analyzes API routes for Vercel Edge Runtime compatibility.\n\n';
output += '## Summary\n\n';

const candidates = [];
const blocked = [];
const warnings = [];

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Check if already using edge runtime
    if (/runtime\s*=\s*['"]edge['"]/.test(content)) {
        return { status: 'already_edge', path: relativePath };
    }

    // Check for Node.js modules
    const nodeImports = [];
    NODE_MODULES.forEach(mod => {
        const regex = new RegExp(`from\\s+['"]${mod}['"]|require\\s*\\(\\s*['"]${mod}['"]`, 'g');
        if (regex.test(content)) {
            nodeImports.push(mod);
        }
    });

    // Check for heavy libraries
    const heavyImports = [];
    HEAVY_LIBS.forEach(lib => {
        const regex = new RegExp(`from\\s+['"]${lib}['"]|require\\s*\\(\\s*['"]${lib}['"]`, 'g');
        if (regex.test(content)) {
            heavyImports.push(lib);
        }
    });

    if (nodeImports.length > 0) {
        return {
            status: 'blocked',
            path: relativePath,
            nodeImports
        };
    }

    if (heavyImports.length > 0) {
        return {
            status: 'warning',
            path: relativePath,
            heavyImports
        };
    }

    return { status: 'candidate', path: relativePath };
}

function scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`Directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (file === 'route.ts' || file === 'route.js') {
            console.log(`Analyzing: ${fullPath}`);
            const result = analyzeFile(fullPath);

            if (result.status === 'blocked') {
                console.log(`   [X] Cannot migrate: Uses Node.js modules (${result.nodeImports.join(', ')})`);
                blocked.push(result);
            } else if (result.status === 'warning') {
                console.log(`   [⚠] Warning: Heavy libraries detected (${result.heavyImports.join(', ')})`);
                warnings.push(result);
            } else if (result.status === 'candidate') {
                console.log(`   [✓] Candidate for Edge!`);
                candidates.push(result);
            } else if (result.status === 'already_edge') {
                console.log(`   [✓] Already using Edge runtime`);
            }
        }
    });
}

// Run the scan
scanDirectory(TARGET_DIR);

// Generate Report
output += `- **Total Routes Analyzed**: ${candidates.length + blocked.length + warnings.length}\n`;
output += `- **✅ Ready to Migrate**: ${candidates.length}\n`;
output += `- **⚠️ Needs Review**: ${warnings.length}\n`;
output += `- **❌ Cannot Migrate**: ${blocked.length}\n\n`;

// Candidates Section
if (candidates.length > 0) {
    output += '## ✅ Ready to Migrate (No Blockers)\n\n';
    output += 'These routes can be migrated to Edge runtime immediately:\n\n';
    candidates.forEach(c => {
        output += `- \`${c.path}\`\n`;
    });
    output += '\n**How to migrate:**\n';
    output += '```typescript\n';
    output += 'export const runtime = \'edge\';\n';
    output += '```\n\n';
}

// Warnings Section
if (warnings.length > 0) {
    output += '## ⚠️ Needs Review (Heavy Libraries)\n\n';
    output += 'These routes use heavy libraries that should be replaced:\n\n';
    warnings.forEach(w => {
        output += `### ${w.path}\n`;
        output += `**Heavy imports**: ${w.heavyImports.map(h => `\`${h}\``).join(', ')}\n\n`;
        output += '**Recommended replacements:**\n';
        w.heavyImports.forEach(lib => {
            if (lib === 'axios') {
                output += '- `axios` → Use native `fetch()`\n';
            } else if (lib === 'lodash') {
                output += '- `lodash` → Use native array methods or smaller utilities\n';
            } else if (lib === 'moment') {
                output += '- `moment` → Use `date-fns` or native `Date` API\n';
            }
        });
        output += '\n';
    });
}

// Blocked Section
if (blocked.length > 0) {
    output += '## ❌ Cannot Migrate (Node.js Dependencies)\n\n';
    output += 'These routes use Node.js-specific modules incompatible with Edge:\n\n';
    blocked.forEach(b => {
        output += `### ${b.path}\n`;
        output += `**Node.js modules**: ${b.nodeImports.map(m => `\`${m}\``).join(', ')}\n\n`;
        output += '**Options:**\n';
        output += '1. Keep in Node.js runtime\n';
        output += '2. Refactor to use Edge-compatible alternatives\n';
        output += '3. Move functionality to a separate API endpoint\n\n';
    });
}

// Performance Benefits
output += '## 📊 Expected Performance Improvements\n\n';
output += '**Edge Runtime Benefits:**\n';
output += '- ⚡ **Faster Cold Starts**: ~50ms vs ~200-500ms (Node.js)\n';
output += '- 🌍 **Global Distribution**: Runs closer to users\n';
output += '- 💰 **Lower Costs**: Reduced execution time\n';
output += '- 📈 **Better Scalability**: Automatic scaling\n\n';

output += '## 🚀 Migration Checklist\n\n';
output += '- [ ] Review candidate routes\n';
output += '- [ ] Add `export const runtime = \'edge\';`\n';
output += '- [ ] Test all endpoints locally\n';
output += '- [ ] Deploy to preview environment\n';
output += '- [ ] Monitor performance metrics\n';
output += '- [ ] Gradually roll out to production\n';

fs.writeFileSync(REPORT_FILE, output);

console.log('\n=================================================');
console.log(`Analysis Complete! Report saved to ${REPORT_FILE}`);
console.log('\nSummary:');
console.log(`  ✅ Ready to Migrate: ${candidates.length}`);
console.log(`  ⚠️  Needs Review: ${warnings.length}`);
console.log(`  ❌ Cannot Migrate: ${blocked.length}`);
console.log('\nTo apply migration:');
console.log('1. Review the report');
console.log('2. Add: export const runtime = \'edge\';');
console.log('3. Replace heavy libraries with lightweight alternatives\n');
