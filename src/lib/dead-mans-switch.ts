import { createClient } from '@supabase/supabase-js';

// Initialize a service client for background tasks (Cron)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface DMSConfig {
    id: number;
    enabled: boolean;
    check_in_interval: string; // Postgres interval string
    last_heartbeat_at: string;
    notification_emails: string[];
    trigger_actions: {
        send_final_email?: boolean;
        unlock_digital_vault?: boolean;
        transfer_ownership_email?: string;
    };
}

export const DMS = {
    // Admin checking in (Heartbeat)
    async checkIn() {
        const now = new Date().toISOString();

        // Update heartbeat
        const { error } = await supabaseAdmin
            .from('dead_mans_switch_config')
            .update({ last_heartbeat_at: now })
            .eq('id', 1);

        if (error) throw error;

        // Log the event
        await supabaseAdmin.from('dead_mans_switch_logs').insert({
            event_type: 'HEARTBEAT',
            details: { timestamp: now, source: 'manual_check_in' }
        });

        return { success: true, timestamp: now };
    },

    async getConfig() {
        const { data, error } = await supabaseAdmin
            .from('dead_mans_switch_config')
            .select('*')
            .single();

        if (error) throw error;
        return data as DMSConfig;
    },

    // Cron job function
    async checkStatusAndTrigger() {
        const config = await this.getConfig();
        if (!config.enabled) return { status: 'DISABLED' };

        const lastHeartbeat = new Date(config.last_heartbeat_at);
        const now = new Date();

        // Parse interval (simplistic parsing for 'X days')
        // In a real app, use a proper interval parser or keep it simple
        // Assuming '7 days', '1 day', etc.
        const intervalDays = parseInt(config.check_in_interval.split(' ')[0]) || 7;
        const deadline = new Date(lastHeartbeat.getTime() + intervalDays * 24 * 60 * 60 * 1000);

        // Warning stage (e.g., 24 hours before deadline)
        const warningThreshold = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);

        if (now > deadline) {
            // TRIGGER THE SWITCH
            await this.triggerSwitch(config);
            return { status: 'TRIGGERED' };
        } else if (now > warningThreshold) {
            // SEND WARNING
            await this.sendWarning(config, deadline);
            return { status: 'WARNING_SENT' };
        }

        return { status: 'OK', deadline };
    },

    async triggerSwitch(config: DMSConfig) {
        // Check if already triggered recently to avoid spam loop?
        // For now, let's just log it.
        console.log('!!! DEAD MANS SWITCH TRIGGERED !!!');

        await supabaseAdmin.from('dead_mans_switch_logs').insert({
            event_type: 'TRIGGERED',
            details: { config_snapshot: config }
        });

        // Execute configured actions
        if (config.trigger_actions.send_final_email) {
            // Send email logic here
        }

        // Disable it to stop repeated firing? Or keep firing?
        // Safety: Disable to prevent loops for this demo
        // await supabaseAdmin.from('dead_mans_switch_config').update({ enabled: false }).eq('id', 1);
    },

    async sendWarning(config: DMSConfig, deadline: Date) {
        console.log('DMS Warning: Check in required soon.');
        // Check if we already sent a warning recently to avoid spam
        // (Omitted for brevity)

        await supabaseAdmin.from('dead_mans_switch_logs').insert({
            event_type: 'WARNING',
            details: { deadline }
        });
    }
};
