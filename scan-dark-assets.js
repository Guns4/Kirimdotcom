const fs = require('fs');
const path = require('path');

function scanDir(dir, found = []) {
    if (!fs.existsSync(dir)) return found;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, found);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Regex to find Image or img tags that look like logos
            // Criteria: src contains 'logo', 'icon', 'kurir', 'expedition' AND class doesn't have invert-on-dark
            // This is loose matching for report purposes.

            const hasPossibleLogo = /<Image|<img/i.test(content) &&
                (/src=.*(logo|icon|cour|kurir|jne|jnt|sicepat)/i.test(content));

            if (hasPossibleLogo && !content.includes('invert-on-dark')) {
                found.push(fullPath);
            }
        }
    });
    return found;
}

const candidates = scanDir('src');

if (candidates.length > 0) {
    console.log('\n[!] Potential assets needing adaptation found in:');
    candidates.forEach(f => console.log('   - ' + path.relative(process.cwd(), f)));
    console.log('\n>>> ACTION: Add className="invert-on-dark" to these images if they are black logos.');
    console.log(`\nTotal files found: ${candidates.length}`);
} else {
    console.log('   [✓] No obvious un-adapted logos found (or strict naming not used).');
}
