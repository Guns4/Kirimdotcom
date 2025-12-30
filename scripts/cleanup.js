const fs = require('fs');
const path = require('path');

const REPORT_FILE = 'DEAD_CODE_REPORT.txt';
const TRASH_DIR = '_trash';

// Exclude recent/critical files from deletion
const EXCLUDE_LIST = [
    'src/lib/bot-alerts.ts',
    'src/hooks/useVoiceInput.ts',
    'src/lib/telegram.ts'
];

if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR);
}

if (!fs.existsSync(REPORT_FILE)) {
    console.error('Report file not found!');
    process.exit(1);
}

const content = fs.readFileSync(REPORT_FILE, 'utf8');
const lines = content.split('\n');

let movedCount = 0;

console.log('Starting cleanup (File Mode)...');

for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;
    if (trimmed.startsWith('Unused files')) continue;

    // Check if line looks like a file path
    if (trimmed.startsWith('src/') || trimmed.startsWith('public/')) {
        // Check Exclusions
        if (EXCLUDE_LIST.includes(trimmed)) {
            console.log(`Skipping EXCLUDED file: ${trimmed}`);
            continue;
        }

        // It's a file
        const filePath = path.resolve(trimmed);

        if (fs.existsSync(filePath)) {
            const destPath = path.join(TRASH_DIR, trimmed);
            const destDir = path.dirname(destPath);

            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            try {
                fs.renameSync(filePath, destPath);
                console.log(`Moved to trash: ${trimmed}`);
                movedCount++;
            } catch (e) {
                console.error(`Failed to move ${trimmed}:`, e.message);
            }
        } else {
            console.warn(`File not found: ${trimmed}`);
        }
    }
}

console.log('================================');
console.log(`Cleanup Complete. Moved ${movedCount} files to /${TRASH_DIR}`);
console.log('Run "npm run typecheck" to verify project integrity.');
