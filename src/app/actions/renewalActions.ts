'use server';

import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';
import { RenewalEmail } from '@/lib/email-templates/RenewalEmail';
import { sendWhatsAppMessage } from '@/app/actions/waGatewayActions'; // Fallback

// Initialize Resend (Make sure process.env.RESEND_API_KEY is set)
const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function processRenewalReminders() {
  console.log('[Renewal] Starting check...');
  const supabase = await createClient();

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  // Helper to get range for a specific day
  const getRange = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  // Find subs expiring in exactly 3 days OR 1 day
  // Note: In production, you might want to split this into batch jobs
  const ranges = [getRange(threeDaysFromNow), getRange(oneDayFromNow)];

  let processedCount = 0;

  for (const range of ranges) {
    const { data: subs, error } = await (supabase as any)
      .from('user_subscriptions')
      .select(
        '*, profiles:user_id(full_name, email, phone), subscription_plans(name)'
      )
      .eq('status', 'active')
      .gte('ends_at', range.start)
      .lte('ends_at', range.end);

    if (error || !subs) continue;

    for (const sub of subs) {
      if (!sub.profiles?.email) continue;

      const daysLeft = Math.round(
        (new Date(sub.ends_at).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const renewalUrl = `https://cekkirim.com/settings/billing`;

      // 1. Send Email
      try {
        await resend.emails.send({
          from: 'CekKirim Billing <billing@cekkirim.com>',
          to: sub.profiles.email,
          subject: `⚠️ Peringatan: Paket ${sub.subscription_plans?.name} Berakhir ${daysLeft} Hari Lagi`,
          react: RenewalEmail({
            name: sub.profiles.full_name || 'Seller',
            planName: sub.subscription_plans?.name || 'Pro',
            daysLeft,
            renewalUrl,
          }) as any,
        });
        console.log(`[Email] Sent to ${sub.profiles.email}`);
      } catch (err) {
        console.error(`[Email] Failed for ${sub.profiles.email}`, err);
      }

      // 2. WA Fallback (Optional)
      if (sub.profiles.phone) {
        try {
          const message = `Halo ${sub.profiles.full_name}, paket ${sub.subscription_plans?.name} Anda akan berakhir dalam ${daysLeft} hari. Segera perpanjang di: ${renewalUrl}`;
          await sendWhatsAppMessage(sub.profiles.phone, message);
          console.log(`[WA] Sent to ${sub.profiles.phone}`);
        } catch (err) {
          // Ignore WA errors, it's just a secondary channel
        }
      }

      processedCount++;
    }
  }

  return { success: true, processed: processedCount };
}
