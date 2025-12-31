import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runRevenueAudit() {
    console.log('🔍 Starting Revenue Audit...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // A. Calculate total cost from successful API logs
    const { data: apiLogs, error: logsError } = await (supabase as any)
        .from('api_logs')
        .select('cost')
        .eq('status_code', 200)
        .gte('created_at', todayISO);

    if (logsError) {
        console.error('Error fetching API logs:', logsError);
        return;
    }

    const totalApiCost = apiLogs?.reduce((sum: number, log: any) => sum + (log.cost || 0), 0) || 0;

    // B. Calculate total debits from wallet transactions
    const { data: transactions, error: transError } = await (supabase as any)
        .from('wallet_transactions')
        .select('amount')
        .eq('type', 'DEBIT')
        .gte('created_at', todayISO);

    if (transError) {
        console.error('Error fetching transactions:', transError);
        return;
    }

    const totalDebits = transactions?.reduce((sum: number, trx: any) => sum + (trx.amount || 0), 0) || 0;

    // C. Compare
    const difference = totalApiCost - totalDebits;

    console.log('📊 Audit Results:');
    console.log(`   API Costs (A): Rp ${totalApiCost.toLocaleString()}`);
    console.log(`   Wallet Debits (B): Rp ${totalDebits.toLocaleString()}`);
    console.log(`   Difference: Rp ${difference.toLocaleString()}`);

    if (difference !== 0) {
        console.error('🚨 REVENUE LEAK DETECTED!');
        console.error(`   Discrepancy: Rp ${Math.abs(difference).toLocaleString()}`);

        // TODO: Send Telegram alert to admin
        // sendTelegramAlert(`🚨 URGENT: Revenue leak detected!\nDifference: Rp ${difference.toLocaleString()}`);

        return false;
    } else {
        console.log('✅ Audit passed. No discrepancies found.');
        return true;
    }
}

// Run audit
runRevenueAudit()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Audit script error:', error);
        process.exit(1);
    });
