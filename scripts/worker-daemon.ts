import { processNextJob } from '../src/lib/job-queue';
import dotenv from 'dotenv';
import path from 'path';

// Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runWorker() {
    console.log('🚀 Job Worker Started...');

    let isRunning = true;

    while (isRunning) {
        try {
            const job = await processNextJob('local-daemon');

            if (!job) {
                // No jobs, wait 5 seconds before next poll
                // process.stdout.write('.');
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                // Did work, maybe small pause
                await new Promise(resolve => setTimeout(resolve, 500));
            }

        } catch (e) {
            console.error('Critical Worker Error:', e);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

runWorker();
