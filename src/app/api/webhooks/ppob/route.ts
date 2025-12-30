import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendWAMessage } from '@/app/actions/waGatewayActions';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();

  // Parse Provider Callback (Mock structure)
  // Provider might send: { trx_id: '...', status: 'FAILED', message: 'Number Blocked' }
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const { trx_id, status, message } = body;

  if (!trx_id || !status) {
    return NextResponse.json(
      { error: 'Invalid payload: Missing trx_id or status' },
      { status: 400 }
    );
  }

  if (status === 'FAILED') {
    console.log(`[Webhook] Processing Refund for ${trx_id}`);

    // 1. Call Atomic Refund RPC
    // Using 'as any' to avoid TypeScript errors before schema generation
    const { data, error } = await (supabase.rpc as any)('process_refund', {
      p_transaction_id: trx_id,
      p_reason: message || 'Provider Failed',
    });

    if (error) {
      console.error('[Webhook] Refund Failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data; // { success: true, new_balance: ..., user_id: ..., user_phone: ... }

    // 2. Notify User if Refund Successful
    if (result && result.success && result.user_phone) {
      const msg = `Mohon maaf transaksi PPOB gagal (${message || 'Unknown Error'}). Saldo telah dikembalikan otomatis ke dompet Anda. Sisa Saldo: Rp ${result.new_balance.toLocaleString('id-ID')}`;

      // Fire and forget WA
      try {
        await sendWAMessage({
          to: result.user_phone,
          message: msg,
        });
      } catch (waError) {
        console.error('[Webhook] Failed to send WA:', waError);
        // Don't fail the webhook response if WA fails
      }
    }

    return NextResponse.json({ success: true, refund_processed: true });
  }

  // Handle SUCCESS or PENDING...
  return NextResponse.json({ received: true });
}
