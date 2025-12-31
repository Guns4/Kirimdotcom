import { createClient } from '@/utils/supabase/server';

export const WebhookEngine = {
    async enqueueWebhook(url: string, payload: any) {
        // Fix: Double await for createClient
        const supabasePromise = await createClient();
        const supabase = await supabasePromise;

        const { error } = await (supabase as any)
            .from('webhook_queue')
            .insert({
                url,
                payload,
                status: 'PENDING',
                next_attempt_at: new Date().toISOString()
            });

        if (error) {
            console.error('Failed to enqueue webhook', error);
            throw error;
        }
    },

    async processQueue() {
        const supabasePromise = await createClient();
        const supabase = await supabasePromise;

        // 1. Fetch Job
        // Note: Real queue system needs row locking (FOR UPDATE SKIP LOCKED) which Supabase JS doesn't fully expose easily without RPC.
        // For simple needs, we fetch and hope for minimal race conditions or use RPC in production.
        const { data: jobs } = await (supabase as any)
            .from('webhook_queue')
            .select('*')
            .in('status', ['PENDING', 'FAILED'])
            .lte('next_attempt_at', new Date().toISOString())
            .limit(5);

        if (!jobs || jobs.length === 0) return;

        for (const job of jobs) {
            try {
                // Mark as processing
                await (supabase as any).from('webhook_queue').update({ status: 'PROCESSING' }).eq('id', job.id);

                // Execute
                const response = await fetch(job.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(job.payload)
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                // Success
                await (supabase as any).from('webhook_queue').update({ status: 'DELIVERED', updated_at: new Date().toISOString() }).eq('id', job.id);

            } catch (error: any) {
                console.error(`Webhook ${job.id} failed:`, error);

                const attempts = job.attempts + 1;
                const status = attempts >= job.max_attempts ? 'GAVE_UP' : 'FAILED';

                // Exponential backoff: 2^attempts * 1 minute
                const nextAttempt = new Date();
                nextAttempt.setMinutes(nextAttempt.getMinutes() + Math.pow(2, attempts));

                await (supabase as any)
                    .from('webhook_queue')
                    .update({
                        status,
                        attempts,
                        last_error: error.message,
                        next_attempt_at: nextAttempt.toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', job.id);
            }
        }
    }
};
