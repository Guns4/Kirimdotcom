import { createClient } from '@/utils/supabase/server';

/**
 * Exponential Backoff Strategy
 * Attempt 1: 0s delay
 * Attempt 2: 5s delay
 * Attempt 3: 1m delay
 * Attempt 4: 1h delay
 * Attempt 5: 6h delay
 */
const RETRY_DELAYS_MS = [0, 5000, 60000, 3600000, 21600000];

export async function processWebhookQueue() {
    const supabase = createClient();

    // 1. Fetch Due Jobs
    const { data: jobs } = await supabase
        .from('webhook_queue')
        .select('*')
        .in('status', ['PENDING', 'FAILED'])
        .lte('next_attempt_at', new Date().toISOString())
        .limit(10); // Batch size

    if (!jobs || jobs.length === 0) return;

    for (const job of jobs) {
        try {
            // Update status to PROCESSING to prevent double-workers
            await supabase.from('webhook_queue').update({ status: 'PROCESSING' }).eq('id', job.id);

            // 2. Execute Webhook
            const res = await fetch(job.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(job.payload),
                signal: AbortSignal.timeout(10000) // 10s Timeout
            });

            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

            // Success
            await supabase
                .from('webhook_queue')
                .update({
                    status: 'DELIVERED',
                    updated_at: new Date()
                })
                .eq('id', job.id);

        } catch (error: any) {
            // Failure Handling
            const attempts = job.attempts + 1;
            const isGiveUp = attempts >= (job.max_attempts || 5);

            const updates: any = {
                attempts: attempts,
                last_error: error.message,
                updated_at: new Date()
            };

            if (isGiveUp) {
                updates.status = 'GAVE_UP';
            } else {
                updates.status = 'FAILED';
                const delay = RETRY_DELAYS_MS[attempts] || 3600000;
                updates.next_attempt_at = new Date(Date.now() + delay).toISOString();
            }

            await supabase.from('webhook_queue').update(updates).eq('id', job.id);
        }
    }
}
