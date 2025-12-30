#!/bin/bash

# =============================================================================
# Automation: Auto-Disbursement
# =============================================================================

echo "Initializing Auto Payout System..."
echo "================================================="

# 1. Helper Logic: Check Fraud (Mock)
echo "1. Creating Utils: src/lib/fraud-check.ts"
mkdir -p src/lib
cat <<EOF > src/lib/fraud-check.ts
export async function isUserFlagged(userId: string): Promise<boolean> {
    // In production, check 'profiles.is_fraud' or similar in database
    console.log(\`[FRAUD_CHECK] Auditing user: \${userId}\`);
    return false; // Default safe for demo
}
EOF

# 2. Main API for Disbursement
echo "2. Creating API: src/app/api/finance/disburse/route.ts"
mkdir -p src/app/api/finance/disburse
cat <<EOF > src/app/api/finance/disburse/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserFlagged } from '@/lib/fraud-check';

export async function POST(request: Request) {
    // Protected by CRON_SECRET for automated jobs
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
         return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { withdrawal_request_id } = await request.json();
        const supabase = await createClient();

        // 1. Fetch Request
        const { data: trx } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('id', withdrawal_request_id)
            .single();

        if (!trx || trx.status !== 'REQUESTED') {
            return NextResponse.json({ error: 'Invalid transaction status or not found' }, { status: 400 });
        }

        // 2. Rule Engine (Fraud & Limits)
        const isFraud = await isUserFlagged(trx.user_id);
        if (isFraud) {
             await supabase.from('withdrawal_requests')
                .update({ status: 'REJECTED', notes: 'Fraud Suspected' })
                .eq('id', trx.id);
             return NextResponse.json({ status: 'REJECTED', reason: 'Fraud' });
        }

        // High Value Check (Manual Approval Required > Rp 500k)
        if (trx.amount > 500000) {
             await supabase.from('withdrawal_requests')
                .update({ status: 'PENDING_APPROVAL', notes: 'High value transaction' })
                .eq('id', trx.id);
             return NextResponse.json({ status: 'PENDING_APPROVAL', amount: trx.amount });
        }

        // 3. Execute Transfer (Idempotent Mock)
        console.log(\`[DISBURSE] Processing ID: \${trx.id} | Amount: \${trx.amount}\`);
        
        // Final Status Update
        await supabase
            .from('withdrawal_requests')
            .update({ 
                status: 'COMPLETED',
                processed_at: new Date().toISOString()
            })
            .eq('id', trx.id);

        return NextResponse.json({ 
            success: true, 
            status: 'COMPLETED', 
            id: trx.id 
        });

    } catch (error: any) {
        console.error('[DISBURSE_ERROR]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
EOF

# 3. Webhook for Async Updates
echo "3. Creating Webhook: src/app/api/webhooks/disbursement/route.ts"
mkdir -p src/app/api/webhooks/disbursement
cat <<EOF > src/app/api/webhooks/disbursement/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const body = await request.json();
    const supabase = await createClient();

    // Mapping Gateway Payload
    const { external_id, status } = body; 

    if (status === 'SUCCESS' || status === 'COMPLETED') {
        await supabase
            .from('withdrawal_requests')
            .update({ status: 'COMPLETED', processed_at: new Date().toISOString() })
            .eq('id', external_id);
    } 
    else if (status === 'FAILED') {
        const { data: trx } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('id', external_id)
            .single();
        
        if (trx) {
            await supabase.from('withdrawal_requests').update({ status: 'FAILED' }).eq('id', external_id);
            
            // AUTOMATIC REFUND TO LEDGER
             await supabase.from('ledger_entries').insert({
                 amount: trx.amount,
                 entry_type: 'CREDIT',
                 description: 'Refund: Withdrawal Failed (Auto)',
                 reference_id: trx.id,
                 metadata: { source: 'disbursement_webhook', reason: 'gateway_failure' }
             });
        }
    }

    return NextResponse.json({ received: true });
}
EOF

echo ""
echo "================================================="
echo "Auto Disbursement System Ready!"
echo "API Endpoint: POST /api/finance/disburse"
echo "Webhook: POST /api/webhooks/disbursement"
