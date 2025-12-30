#!/bin/bash

# =============================================================================
# Recurring Revenue: Automated Billing System
# =============================================================================

echo "Initializing Recurring Billing System..."
echo "================================================="

# 1. Cron API Route
echo "1. Creating API Route: src/app/api/cron/billing/route.ts"
mkdir -p src/app/api/cron/billing
cat <<EOF > src/app/api/cron/billing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendWhatsappNotification } from '@/lib/payment'; // Reusing existing mock

const CRON_SECRET = process.env.CRON_SECRET || 'dev_secret_key';

export async function GET(req: NextRequest) {
  // 1. Security Check
  const authHeader = req.headers.get('authorization');
  if (authHeader !== \`Bearer \${CRON_SECRET}\`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // 2. Fetch Due Subscriptions
  // Fetch active subscriptions where auto_renew is true and billing date <= today
  const { data: subs, error } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_plans(*)')
    .eq('auto_renew', true)
    .eq('status', 'active')
    .lte('next_billing_date', new Date().toISOString());

  if (error || !subs) {
     return NextResponse.json({ message: 'No subscriptions to process or error', details: error });
  }

  const results = {
     processed: 0,
     failed: 0
  };

  // 3. Process Each Subscription
  for (const sub of subs) {
      const plan = sub.subscription_plans;
      if (!plan) continue;

      const cost = sub.billing_cycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
      const amount = Number(cost);

      // Get Wallet
      const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', sub.user_id).single();

      if (wallet && Number(wallet.balance) >= amount) {
          // SUCCESS FLOW
          
          // A. Debit Ledger
          await supabase.from('ledger_entries').insert({
              wallet_id: wallet.id,
              amount: amount,
              entry_type: 'DEBIT',
              description: \`Auto-Renewal: \${plan.plan_name} (\${sub.billing_cycle})\`,
              reference_id: sub.id
          });

          // B. Extend Subscription
          const nextDate = new Date(sub.next_billing_date);
          if (sub.billing_cycle === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
          else nextDate.setMonth(nextDate.getMonth() + 1);

          await supabase.from('user_subscriptions').update({
              next_billing_date: nextDate.toISOString(),
              last_payment_date: new Date().toISOString(),
              status: 'active' 
          }).eq('id', sub.id);

          // C. Log Payment
          await supabase.from('payment_history').insert({
              user_id: sub.user_id,
              subscription_id: sub.id,
              amount: amount,
              plan_code: plan.plan_code,
              status: 'confirmed',
              payment_method: 'wallet_auto',
              billing_cycle: sub.billing_cycle
          });

          await sendWhatsappNotification(sub.user_id, \`Langganan \${plan.plan_name} berhasil diperpanjang!\`);
          results.processed++;

      } else {
          // FAILURE FLOW (Insufficient Funds)
          
          // A. Set Status to Past Due
          await supabase.from('user_subscriptions').update({
              status: 'past_due'
          }).eq('id', sub.id);

          // B. Notify
          await sendWhatsappNotification(sub.user_id, \`Gagal perpanjang \${plan.plan_name}. Saldo tidak cukup. Mohon topup segera.\`);
          results.failed++;
      }
  }

  return NextResponse.json({ 
     success: true, 
     processed: results.processed, 
     failed: results.failed 
  });
}
EOF

echo ""
echo "================================================="
echo "Recurring Billing System Ready!"
echo "1. Endpoint: /api/cron/billing"
echo "2. Setup Cron Job (e.g. Vercel Cron) to hit this URL daily."
echo "3. Header Required: 'Authorization: Bearer <CRON_SECRET>'"
