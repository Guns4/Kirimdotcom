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
  } else if (status === 'FAILED') {
    const { data: trx } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', external_id)
      .single();

    if (trx) {
      await supabase.from('withdrawal_requests').update({ status: 'FAILED' }).eq('id', external_id);

      // REFUND LEDGER AUTOMATICALLY
      // We need to call our Ledger Internal API or Insert directly
      await supabase.from('ledger_entries').insert({
        wallet_id: trx.wallet_id, // Need to fetch wallet_id or assume link
        amount: trx.amount,
        entry_type: 'CREDIT',
        description: 'Refund: Withdrawal Failed',
        reference_id: trx.id,
      });
    }
  }

  return NextResponse.json({ received: true });
}
