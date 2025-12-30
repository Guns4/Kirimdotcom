const fs = require('fs');
const path = require('path');

const TRASH_DIR = '_trash';

if (!fs.existsSync(TRASH_DIR)) {
    console.log('No trash directory found. Nothing to restore.');
    process.exit(0);
}

function restoreDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        // Calculate relative path from TRASH_DIR to find original location
        const relPath = path.relative(TRASH_DIR, fullPath);
        const originalPath = path.resolve(relPath); // Restores to CWD/relPath (e.g. src/foo.ts)

        if (entry.isDirectory()) {
            restoreDir(fullPath);
        } else {
            const originalDir = path.dirname(originalPath);
            if (!fs.existsSync(originalDir)) {
                fs.mkdirSync(originalDir, { recursive: true });
            }

            try {
                fs.renameSync(fullPath, originalPath);
                console.log(`Restored: ${relPath}`);
            } catch (e) {
                console.error(`Failed to restore ${relPath}:`, e.message);
            }
        }
    }
}

console.log('Restoring files from _trash...');
restoreDir(TRASH_DIR);
console.log('Restore Complete.');
console.log('You can now delete the empty _trash directory.');
