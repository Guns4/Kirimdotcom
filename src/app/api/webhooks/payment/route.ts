import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logEvent } from '@/app/actions/analyticsActions';

// ============================================
// PAYMENT WEBHOOK HANDLER
// ============================================
// Modular structure ready for any payment gateway

export const runtime = 'edge';

// Supported payment gateways
type PaymentGateway = 'midtrans' | 'xendit' | 'lemonsqueezy' | 'manual';

export async function POST(request: NextRequest) {
  try {
    // Get gateway from query or header
    const { searchParams } = new URL(request.url);
    const gateway = (searchParams.get('gateway') as PaymentGateway) || 'manual';

    // Parse body
    const body = await request.json();

    // Get signature from header (for verification)
    const signature =
      request.headers.get('x-callback-token') ||
      request.headers.get('x-signature') ||
      request.headers.get('x-xendit-callback-token') ||
      '';

    // Log webhook (for debugging - remove in production)
    console.log(
      `[Webhook] Gateway: ${gateway}, Event: ${body.event || 'unknown'}`
    );

    // Route to appropriate handler
    let result;
    switch (gateway) {
      case 'midtrans':
        result = await handleMidtransWebhook(body, signature);
        break;
      case 'xendit':
        result = await handleXenditWebhook(body, signature);
        break;
      case 'lemonsqueezy':
        result = await handleLemonSqueezyWebhook(body, signature);
        break;
      case 'manual':
        result = await handleManualPayment(body);
        break;
      default:
        return NextResponse.json({ error: 'Unknown gateway' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Webhook Error]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ============================================
// MIDTRANS HANDLER
// ============================================
async function handleMidtransWebhook(body: any, signature: string) {
  const supabase = await createClient();

  const { order_id, transaction_status, gross_amount, status_code, signature_key, custom_field1 } = body;

  // Verify signature if provided
  const SERVER_KEY = process.env.PAYMENT_SERVER_KEY || 'mock-server-key';
  if (signature_key) {
    const payload = order_id + status_code + gross_amount + SERVER_KEY;
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha512').update(payload).digest('hex');
    if (hash !== signature_key) {
      return { success: false, error: 'Invalid signature' };
    }
  }

  // Handle settlement/capture
  if (transaction_status === 'settlement' || transaction_status === 'capture') {
    const userId = custom_field1;
    if (!userId) {
      return { success: false, error: 'Missing user ID' };
    }

    const { data: wallet } = await (supabase as any).from('wallets').select('id').eq('user_id', userId).single();
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    // Credit ledger
    await (supabase as any).from('ledger_entries').insert({
      wallet_id: wallet.id,
      amount: parseFloat(gross_amount),
      entry_type: 'CREDIT',
      description: `Topup via ${body.payment_type || 'Midtrans'}`,
      reference_id: order_id,
      metadata: body
    });

    return { success: true, message: 'Payment credited', gateway: 'midtrans' };
  }

  return { success: true, message: 'Midtrans webhook received', gateway: 'midtrans' };
}


// ============================================
// XENDIT HANDLER (Placeholder)
// ============================================
async function handleXenditWebhook(body: any, signature: string) {
  // TODO: Implement Xendit signature verification
  // const isValid = verifyXenditSignature(body, signature, process.env.XENDIT_CALLBACK_TOKEN)

  // TODO: Implement Xendit status handling
  // const { external_id, status, paid_amount } = body

  // if (status === 'PAID') {
  //   await activateSubscription(external_id)
  // }

  return {
    success: true,
    message: 'Xendit webhook received (not implemented yet)',
    gateway: 'xendit',
  };
}

// ============================================
// LEMONSQUEEZY HANDLER (Placeholder)
// ============================================
async function handleLemonSqueezyWebhook(body: any, signature: string) {
  // TODO: Implement LemonSqueezy signature verification
  // const isValid = verifyLemonSqueezySignature(body, signature, process.env.LS_SIGNING_SECRET)

  // TODO: Implement LemonSqueezy status handling
  // if (body.meta?.event_name === 'order_created') {
  //   const orderId = body.data.id
  //   await activateSubscription(orderId)
  // }

  return {
    success: true,
    message: 'LemonSqueezy webhook received (not implemented yet)',
    gateway: 'lemonsqueezy',
  };
}

// ============================================
// MANUAL PAYMENT HANDLER (Admin use)
// ============================================
async function handleManualPayment(body: any) {
  const { userId, planId, transactionId, adminSecret } = body;

  // Verify admin secret
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return {
      success: false,
      error: 'Invalid admin secret',
    };
  }

  // TODO: Implement manual activation
  // await activateSubscription(userId, planId)

  return {
    success: true,
    message: 'Manual payment processed',
    gateway: 'manual',
    userId,
    planId,
  };
}

// ============================================
// HELPER: Activate Subscription
// ============================================
async function activateSubscription(
  userId: string,
  planId: string,
  gateway?: PaymentGateway
) {
  const supabase = await createClient();

  // Calculate end date based on plan
  const planDurations: Record<string, number> = {
    'pro-monthly': 30,
    'pro-yearly': 365,
    'pro-lifetime': 36500, // ~100 years
  };

  const durationDays = planDurations[planId] || 30;
  const startDate = new Date();
  const endDate = new Date(
    startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
  );

  // Create or update subscription
  // Note: Using 'as any' until types are regenerated after running SQL schema
  const { error } = await (supabase as any).from('subscriptions').upsert(
    {
      user_id: userId,
      plan_type: planId.includes('monthly')
        ? 'monthly'
        : planId.includes('yearly')
          ? 'yearly'
          : 'lifetime',
      plan_name: 'Pro',
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      payment_gateway: gateway || 'manual',
      last_payment_id: null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );

  if (error) {
    console.error('Subscription activation error:', error);
    throw error;
  }

  // Log tracking event
  // Using server-side logEvent since this is background API
  await logEvent('complete_purchase', {
    planId,
    gateway: gateway || 'manual'
  });

  return true;
}
