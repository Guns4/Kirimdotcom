const { exec } = require('child_process');
const fs = require('fs');

console.log('Spawning knip...');

// Increase buffer to 10MB to be safe
exec('npx knip --no-exit-code', { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
    console.log('Execution finished.');
    console.log('Stdout length:', stdout ? stdout.length : 0);
    console.log('Stderr length:', stderr ? stderr.length : 0);

    if (error) {
        console.warn('Exec Error (ignored since no-exit-code is used):', error.message);
    }

    const output = (stdout || '') + '\n' + (stderr || '');

    if (output.trim().length === 0) {
        console.error('CRITICAL: Captured NO output from Knip.');
    } else {
        fs.writeFileSync('DEAD_CODE_REPORT.txt', output, 'utf8');
        console.log('Saved output to DEAD_CODE_REPORT.txt');
    }
});
