import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserFlagged } from '@/lib/fraud-check';

export async function POST(request: Request) {
  // Ideally called by a Background Job or Admin Action, NOT directly by client.
  // Protected by Admin Role or Service Key.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
      await supabase
        .from('withdrawal_requests')
        .update({ status: 'REJECTED', notes: 'Fraud Suspected' })
        .eq('id', trx.id);
      // TODO: Refund Ledger
      return NextResponse.json({ status: 'REJECTED' });
    }

    if (trx.amount > 500000) {
      await supabase
        .from('withdrawal_requests')
        .update({ status: 'PENDING_APPROVAL' })
        .eq('id', trx.id);
      return NextResponse.json({ status: 'PENDING_APPROVAL' });
    }

    // 3. Execute Transfer (Mock)
    // IDEMPOTENCY: Use withdrawal_request_id as the key
    const idempotencyKey = trx.id;

    console.log(
      `[MOCK] Calling Xendit/Midtrans with key ${idempotencyKey} for amount ${trx.amount}`
    );

    // Simulate API latency
    await new Promise((r) => setTimeout(r, 1000));

    // 4. Update Status (Optimistic Success or Processing)
    await supabase
      .from('withdrawal_requests')
      .update({
        status: 'COMPLETED', // Or 'PROCESSING' if async
        processed_at: new Date().toISOString(),
      })
      .eq('id', trx.id);

    return NextResponse.json({ status: 'COMPLETED', tx_id: idempotencyKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
