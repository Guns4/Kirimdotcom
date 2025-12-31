const fs = require('fs');
const path = require('path');

function scanDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            scanDir(filePath);
        } else if (file === 'route.ts') {
            const content = fs.readFileSync(filePath, 'utf-8');

            // Check for POST/PUT without Zod
            if ((content.includes('POST') || content.includes('PUT')) && !content.includes('zod')) {
                console.warn(`[WARNING] No Zod validation detected in: ${filePath}`);
            }
        }
    });
}

console.log('🔍 Scanning API Routes for Validation...');
if (fs.existsSync('src/app/api')) {
    scanDir('src/app/api');
} else {
    console.log('src/app/api not found.');
}
