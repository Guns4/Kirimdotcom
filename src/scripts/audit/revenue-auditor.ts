import { createClient } from '@supabase/supabase-js';

// Standalone script, so we use supabase-js directly with ADMIN key usually
// For this template, we assume environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runRevenueAudit() {
    console.log('💰 Starting Shadow Auditor...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    console.log(`📊 Auditing date: ${dateStr}`);

    // 1. Fetch successful API Usage Logs (Source of Truth for billing)
    // Assuming 'metering_logs' table exists from previous steps
    const { count: requestCount, error: logError } = await supabase
        .from('metering_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'success')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`);

    if (logError) {
        console.error('Error fetching logs:', logError);
        return;
    }

    // 2. Fetch Wallet Transactions (Actual Billing)
    const { count: txCount, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'API_USAGE') // Assuming this type is used
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`);

    if (txError) {
        console.error('Error fetching transactions:', txError);
        return;
    }

    // 3. Compare
    const discrepancies = (requestCount || 0) - (txCount || 0);
    const status = discrepancies === 0 ? 'MATCH' : 'MISMATCH';

    console.log(`   Requests: ${requestCount}`);
    console.log(`   Transactions: ${txCount}`);
    console.log(`   Status: ${status}`);

    // 4. Detailed Check (if mismatch) - Simplified for MVP
    let details = {};
    if (status === 'MISMATCH') {
        details = {
            message: 'Count mismatch detected',
            diff: discrepancies
        };
    }

    // 5. Log Result
    const { error: auditError } = await supabase
        .from('financial_audit_logs')
        .insert({
            audit_date: dateStr,
            total_requests: requestCount || 0,
            total_billed_transactions: txCount || 0,
            discrepancy_count: Math.abs(discrepancies),
            discrepancy_details: details,
            status: status
        });

    if (auditError) console.error('Error saving audit log:', auditError);
    else console.log('✅ Audit saved successfully.');
}

// Execute
runRevenueAudit().catch(console.error);
