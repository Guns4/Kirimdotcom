import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Service Role needed for worker)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service role for worker
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface JobPayload {
    [key: string]: any;
}

export type JobHandler = (payload: any) => Promise<void>;

// Registry of Job Handlers
const jobHandlers: Record<string, JobHandler> = {
    'send-email': async (payload) => {
        console.log('📧 Sending email to:', payload.email);
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Email sent!');
    },
    'generate-report': async (payload) => {
        console.log('fj Generating report for:', payload.userId);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Report generated!');
    },
    // Add more handlers here
};

export async function enqueueJob(type: string, payload: JobPayload) {
    const { data, error } = await supabase
        .from('jobs')
        .insert({ type, payload, status: 'pending' })
        .select()
        .single();

    if (error) {
        console.error('Failed to enqueue job:', error);
        throw error;
    }

    return data;
}

export async function processNextJob(workerId: string = 'worker-1') {
    // 1. Fetch and Lock a Job (Postgres SKIP LOCKED is best, but simulated here via update/select)
    // Simple strategy: Update the first 'pending' job to 'processing'

    // Note: For high concurrency, use a stored procedure or proper locking.
    // This is a simplified reliable-fetch implementation.

    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .lt('attempts', 3) // Assuming max_attempts logic in query or handled later
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

    if (error || !job) {
        return null; // No jobs found
    }

    // Lock the job
    const { error: lockError } = await supabase
        .from('jobs')
        .update({
            status: 'processing',
            locked_at: new Date().toISOString(),
            locked_by: workerId,
            attempts: job.attempts + 1
        })
        .eq('id', job.id)
        .eq('status', 'pending'); // Optimistic lock

    if (lockError) {
        // Race condition lost
        return null;
    }

    console.log(`🔨 Processing Job [${job.id}] Type: ${job.type}`);

    try {
        const handler = jobHandlers[job.type];
        if (!handler) {
            throw new Error(`No handler for job type: ${job.type}`);
        }

        await handler(job.payload);

        // Complete
        await supabase.from('jobs').update({ status: 'completed' }).eq('id', job.id);
        console.log(`✅ Job [${job.id}] Completed`);
        return job;

    } catch (err: any) {
        console.error(`❌ Job [${job.id}] Failed:`, err);
        await supabase.from('jobs').update({
            status: 'failed',
            last_error: err.message,
            // If max attempts reached, keep failed, else maybe reset to pending (retry logic can be here)
        }).eq('id', job.id);
        return job;
    }
}
