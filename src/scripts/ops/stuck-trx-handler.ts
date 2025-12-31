import { createClient } from '@/utils/supabase/server'; // or client depending on execution context. using stub for script.
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Standalone script context usually requires direct env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Credentials');
    process.exit(1);
}

const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

async function checkVendorStatus(trxId: string, vendorId: string): Promise<'SUCCESS' | 'FAILED' | 'PENDING'> {
    // Mock Vendor Check
    // In real app: call axios.get(`https://vendor-api.com/check/${trxId}`)
    // For simulation: Randomly return status
    const rand = Math.random();
    if (rand > 0.8) return 'SUCCESS';
    if (rand > 0.4) return 'FAILED'; // 40% chance failed/not found -> Refund
    return 'PENDING';
}

async function processStuckTransactions() {
    console.log('🕵️ Scanning for STUCK transactions (> 24h)...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: stuckTrx, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'PENDING')
        .lt('created_at', twentyFourHoursAgo);

    if (error) {
        console.error('DB Error:', error);
        return;
    }

    if (!stuckTrx || stuckTrx.length === 0) {
        console.log('✅ No stuck transactions found.');
        return;
    }

    console.log(`Found ${stuckTrx.length} stuck transactions. Processing...`);

    for (const trx of stuckTrx) {
        try {
            const realStatus = await checkVendorStatus(trx.id, trx.vendor_id);
            console.log(`[TRX: ${trx.id}] Vendor says: ${realStatus}`);

            if (realStatus === 'SUCCESS') {
                await supabase
                    .from('transactions')
                    .update({ status: 'SUCCESS', updated_at: new Date() })
                    .eq('id', trx.id);
                console.log('  -> Updated to SUCCESS');
            }
            else if (realStatus === 'FAILED') {
                // AUTO REFUND LOGIC
                // 1. Mark Trx Failed
                await supabase
                    .from('transactions')
                    .update({ status: 'FAILED', updated_at: new Date() })
                    .eq('id', trx.id);

                // 2. Return Balance to User
                const { error: refundError } = await supabase.rpc('increment_balance', {
                    user_id: trx.user_id,
                    amount: trx.amount
                });

                if (refundError) console.error('  -> Balance Refund Failed!', refundError);
                else console.log('  -> Refunded & Mark FAILED');
            }
            // If still PENDING, do nothing (wait for manual check or next cycle)

        } catch (e) {
            console.error(`  -> Error processing ${trx.id}`, e);
        }
    }
}

// Execute
processStuckTransactions();
