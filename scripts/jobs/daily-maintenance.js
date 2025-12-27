const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runMaintenance() {
    console.log('[Maintenance] Starting daily cleanup...');

    // 1. Clear Expired Auth Tokens (Example)
    // Supabase handles this internally usually, but we can clean custom logs
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { error: logError } = await supabase
        .from('webhook_logs')
        .delete()
        .lt('created_at', twoWeeksAgo.toISOString());

    if (logError) console.error('Failed to clear logs:', logError.message);
    else console.log('Cleared old webhook logs.');

    // 2. Vacuum / Optimize (If using custom SQL function exposed via RPC)
    // await supabase.rpc('vacuum_analyze');

    // 3. Check System Health
    const start = Date.now();
    const { data, error } = await supabase.from('user_points').select('user_id').limit(1);
    const latency = Date.now() - start;

    console.log(`[Health] DB Latency: ${latency}ms`);

    if (error || latency > 1000) {
        console.error('[Health] System degraded! Sending alert...');
        // sendEmailAlert('admin@cekkirim.com', 'High Latency Detected', `Latency: ${latency}ms`);
    }

    console.log('[Maintenance] Complete.');
}

runMaintenance();
