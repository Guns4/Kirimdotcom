import { createClient } from '@/utils/supabase/server';

export interface DMSConfig {
    trustee_email: string;
    emergency_info: string;
    last_heartbeat_at: string;
    status: 'ACTIVE' | 'WARNING_SENT' | 'TRIGGERED';
}

/**
 * Send Heartbeat
 * Resets the timer.
 */
export async function sendHeartbeat() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('dead_mans_switch_config')
        .update({
            last_heartbeat_at: new Date().toISOString(),
            status: 'ACTIVE'
        })
        .eq('user_id', user.id);

    if (error) throw error;
    return true;
}

/**
 * Check Status (Run Daily via Cron)
 */
export async function checkSwitchStatus() {
    const supabase = await createClient();

    // Fetch all active configs (In real app, process in batches)
    const { data: configs, error } = await supabase
        .from('dead_mans_switch_config')
        .select('*')
        .neq('status', 'TRIGGERED'); // Don't re-trigger

    if (error || !configs) return;

    const NOW = new Date().getTime();
    const DAY = 24 * 60 * 60 * 1000;

    for (const config of configs) {
        const lastBeat = new Date(config.last_heartbeat_at).getTime();
        const diffDays = Math.floor((NOW - lastBeat) / DAY);

        // Phase 2: Trigger (37 Days)
        if (diffDays >= 37) {
            console.log(`[DMS] TRIGGERED for user ${config.user_id}. Emailling trustee: ${config.trustee_email}`);

            // TODO: Integrate Real Email Service (Resend/SendGrid)
            // await sendEmail({
            //   to: config.trustee_email,
            //   subject: 'EMERGENCY: Protocol 37 Initiated',
            //   body: `The user has been inactive for 37 days. Here is the emergency info: \n\n ${config.emergency_info}`
            // });

            await supabase.from('dead_mans_switch_config')
                .update({ status: 'TRIGGERED' })
                .eq('id', config.id);
        }
        // Phase 1: Warning (30 Days)
        else if (diffDays >= 30 && config.status !== 'WARNING_SENT') {
            console.log(`[DMS] WARNING for user ${config.user_id}.`);

            // await sendEmail({ to: user_email, subject: 'Are you OK?', body: 'Click heartbeat button!' });

            await supabase.from('dead_mans_switch_config')
                .update({ status: 'WARNING_SENT' })
                .eq('id', config.id);
        }
    }
}
