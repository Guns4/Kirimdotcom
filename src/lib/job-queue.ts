import { createClient } from '@/utils/supabase/server';

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD';

export interface Job {
    id: string;
    job_type: string;
    payload: any;
    status: JobStatus;
    attempt_count: number;
}

// Map job types to actual handler functions
const JOB_HANDLERS: Record<string, (payload: any) => Promise<void>> = {
    'send-email': async (payload) => {
        console.log(`[Worker] Sending email to ${payload.to}...`);
        // Simulate failure for demo if payload has 'fail: true'
        if (payload.fail) throw new Error('Simulated Email Server Error');
        await new Promise(r => setTimeout(r, 500));
        console.log('[Worker] Email sent!');
    },
    'webhook-trigger': async (payload) => {
        console.log(`[Worker] Triggering webhook: ${payload.url}`);
        await new Promise(r => setTimeout(r, 500));
    }
};

export async function enqueueJob(jobType: string, payload: any) {
    const supabase = await createClient();
    const { error } = await supabase.from('job_queues').insert({
        job_type: jobType,
        payload
    });
    if (error) console.error('Failed to enqueue job:', error);
}

export async function processPendingJobs() {
    const supabase = await createClient();

    // 1. Fetch available jobs (Simple poller)
    // In high scale, use RPC 'select_for_update' to prevent race conditions.
    // For this MVP, we fetch one by one.
    const { data: jobs, error } = await supabase
        .from('job_queues')
        .select('*')
        .in('status', ['PENDING', 'FAILED'])
        .lte('next_run_at', new Date().toISOString())
        .limit(5);

    if (error) {
        console.error('Error fetching jobs:', error);
        return;
    }

    if (!jobs || jobs.length === 0) {
        return { processed: 0 };
    }

    let processedCount = 0;

    for (const job of jobs) {
        // Locking: Mark as PROCESSING immediately
        await supabase.from('job_queues').update({ status: 'PROCESSING' }).eq('id', job.id);

        try {
            const handler = JOB_HANDLERS[job.job_type];
            if (!handler) {
                throw new Error(`No handler for job type: ${job.job_type}`);
            }

            // Execute
            await handler(job.payload);

            // Success
            await supabase.from('job_queues').update({
                status: 'COMPLETED',
                updated_at: new Date().toISOString()
            }).eq('id', job.id);

            processedCount++;

        } catch (err: any) {
            // Failure Logic
            const newAttempts = (job.attempt_count || 0) + 1;
            const isDead = newAttempts >= 5;

            // Exponential Backoff: 1m, 2m, 4m, 8m, 16m
            // Formula: Now + (60 * 2^(attempts-1)) seconds
            const backoffSeconds = 60 * Math.pow(2, newAttempts - 1);
            const nextRun = new Date(Date.now() + backoffSeconds * 1000);

            await supabase.from('job_queues').update({
                status: isDead ? 'DEAD' : 'FAILED',
                attempt_count: newAttempts,
                next_run_at: isDead ? null : nextRun.toISOString(),
                last_error: err.message,
                updated_at: new Date().toISOString()
            }).eq('id', job.id);

            console.error(`[Worker] Job ${job.id} failed (Attempt ${newAttempts}). Retry at ${nextRun.toISOString()}`);
        }
    }

    return { processed: processedCount };
}
