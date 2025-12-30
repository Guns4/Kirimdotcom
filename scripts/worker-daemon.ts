import { processPendingJobs } from '../src/lib/job-queue';

/**
 * Worker Daemon
 * Runs continually to process jobs.
 * Usage: npx tsx scripts/worker-daemon.ts
 */

async function loop() {
    console.log('[Daemon] Checking for jobs...');
    try {
        const result = await processPendingJobs();
        if (result && result.processed > 0) {
            console.log(`[Daemon] Processed ${result.processed} jobs.`);
        }
    } catch (error) {
        console.error('[Daemon] Error:', error);
    }
}

// Run every 10 seconds
console.log('[Daemon] Starting Job Worker...');
setInterval(loop, 10000);
loop(); // First run immediately
