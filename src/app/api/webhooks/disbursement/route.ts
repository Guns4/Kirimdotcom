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
