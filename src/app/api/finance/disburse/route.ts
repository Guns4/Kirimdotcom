import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserFlagged } from '@/lib/fraud-check';

export async function POST(request: Request) {
    // Protected by CRON_SECRET for automated jobs
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
        console.log(`[DISBURSE] Processing ID: ${trx.id} | Amount: ${trx.amount}`);
        
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
