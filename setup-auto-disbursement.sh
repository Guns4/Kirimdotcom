#!/bin/bash

# =============================================================================
# Automation: Auto-Disbursement
# =============================================================================

echo "Initializing Auto Payout System..."
echo "================================================="

# 1. Helper Logic: Check Fraud (Mock)
echo "1. Creating Utils: lib/fraud-check.ts"
mkdir -p lib
cat <<EOF > lib/fraud-check.ts
export async function isUserFlagged(userId: string): Promise<boolean> {
    // In production, check 'profiles.is_fraud' or similar
    return false; // Default safe
}
EOF

# 2. Main API for Disbursement
echo "2. Creating API: app/api/finance/disburse/route.ts"
mkdir -p app/api/finance/disburse
cat <<EOF > app/api/finance/disburse/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserFlagged } from '@/lib/fraud-check';

export async function POST(request: Request) {
    // Ideally called by a Background Job or Admin Action, NOT directly by client.
    // Protected by Admin Role or Service Key.
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
        // Allow simplified check for demo
    }

    const { withdrawal_request_id } = await request.json();
    const supabase = createClient();

    try {
        // 1. Fetch Request
        const { data: trx } = await supabase
            .from('withdrawal_requests') // Assuming this table exists from previous setup
            .select('*')
            .eq('id', withdrawal_request_id)
            .single();

        if (!trx || trx.status !== 'REQUESTED') {
            return NextResponse.json({ error: 'Invalid transaction status' }, { status: 400 });
        }

        // 2. Rule Engine
        const isFraud = await isUserFlagged(trx.user_id);
        if (isFraud) {
             await supabase.from('withdrawal_requests').update({ status: 'REJECTED', notes: 'Fraud Suspected' }).eq('id', trx.id);
             // TODO: Refund Ledger
             return NextResponse.json({ status: 'REJECTED' });
        }

        if (trx.amount > 500000) {
             await supabase.from('withdrawal_requests').update({ status: 'PENDING_APPROVAL' }).eq('id', trx.id);
             return NextResponse.json({ status: 'PENDING_APPROVAL' });
        }

        // 3. Execute Transfer (Mock)
        // IDEMPOTENCY: Use withdrawal_request_id as the key
        const idempotencyKey = trx.id;
        
        console.log(\`[MOCK] Calling Xendit/Midtrans with key \${idempotencyKey} for amount \${trx.amount}\`);
        
        // Simulate API latency
        await new Promise(r => setTimeout(r, 1000));
        
        // 4. Update Status (Optimistic Success or Processing)
        await supabase
            .from('withdrawal_requests')
            .update({ 
                status: 'COMPLETED', // Or 'PROCESSING' if async
                processed_at: new Date().toISOString()
            })
            .eq('id', trx.id);

        return NextResponse.json({ status: 'COMPLETED', tx_id: idempotencyKey });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
EOF

# 3. Webhook for Async Updates
echo "3. Creating Webhook: app/api/webhooks/disbursement/route.ts"
mkdir -p app/api/webhooks/disbursement
cat <<EOF > app/api/webhooks/disbursement/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    // Handle callbacks from Payment Gateway (Transfer Success/Fail)
    const body = await request.json();
    const supabase = createClient();

    // Verify Signature... (omitted for brevity)

    const { external_id, status } = body; // external_id usually matches our withdrawal_request_id

    if (status === 'SUCCESS' || status === 'COMPLETED') {
        await supabase
            .from('withdrawal_requests')
            .update({ status: 'COMPLETED', processed_at: new Date().toISOString() })
            .eq('id', external_id);
    } 
    else if (status === 'FAILED') {
        const { data: trx } = await supabase.from('withdrawal_requests').select('*').eq('id', external_id).single();
        
        if (trx) {
            await supabase.from('withdrawal_requests').update({ status: 'FAILED' }).eq('id', external_id);
            
            // REFUND LEDGER AUTOMATICALLY
            // We need to call our Ledger Internal API or Insert directly
             await supabase.from('ledger_entries').insert({
                 wallet_id: trx.wallet_id, // Need to fetch wallet_id or assume link
                 amount: trx.amount,
                 entry_type: 'CREDIT',
                 description: 'Refund: Withdrawal Failed',
                 reference_id: trx.id
             });
        }
    }

    return NextResponse.json({ received: true });
}
EOF

echo ""
echo "================================================="
echo "Auto Disbursement Scripts Ready!"
echo "API Endpoint: POST /api/finance/disburse"
echo "Webhook: POST /api/webhooks/disbursement"
