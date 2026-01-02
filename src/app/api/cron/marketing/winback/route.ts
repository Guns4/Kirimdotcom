import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendAdminAlert } from '@/lib/admin-alert'; // Reusing alerter for demo

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient();

  // 1. Find Targets
  // CHURN_RISK, and haven't received a campaign in 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: targets } = await supabase
    .from('user_segments')
    .select('user_id')
    .eq('segment', 'CHURN_RISK')
    .or(`last_campaign_at.is.null,last_campaign_at.lt.${thirtyDaysAgo.toISOString()}`)
    .limit(50); // Batch size

  if (!targets || targets.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No targets found' });
  }

  let sentCount = 0;

  for (const target of targets) {
    // 2. Generate Voucher
    const code = `WB-${target.user_id.split('-')[0].toUpperCase()}`; // Simple Code
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 Days expiry

    // Insert Voucher
    const { error } = await supabase.from('marketing_vouchers').upsert(
      {
        user_id: target.user_id,
        code,
        discount_amount: 5000, // Rp 5.000
        max_usage: 1,
        expires_at: expires.toISOString(),
      },
      { onConflict: 'code' }
    ); // If code exists, skip/update (idempotent)

    if (!error) {
      // 3. Mark Campaign Sent
      await supabase
        .from('user_segments')
        .update({ last_campaign_at: new Date().toISOString() })
        .eq('user_id', target.user_id);

      // 4. Mock Send
      // await whatsapp.send(target.user_id, "We miss you! Use " + code);
      console.log(`[WINBACK] Sent ${code} to ${target.user_id}`);
      sentCount++;
    }
  }

  if (sentCount > 0) {
    await sendAdminAlert('Winback Campaign Run', `Sent ${sentCount} vouchers to Churn Risk users.`);
  }

  return NextResponse.json({ processed: sentCount, targets: targets.length });
}
