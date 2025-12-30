'use server';

import { createClient } from '@/utils/supabase/server';
import { safeAction } from '@/lib/safe-action';
import webpush from 'web-push';

// Initialize VAPID (Note: Ensure env vars are set)
if (
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_EMAIL
) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const subscribeToPush = async (subscription: any) => {
  return safeAction(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Save subscription to DB (create 'push_subscriptions' table manually or via migration if needed)
    // For now logging to console to demo flow
    console.log('Subscribing user:', user?.id, subscription);

    // 2. Send test notification immediately
    const payload = JSON.stringify({
      title: 'Welcome!',
      body: 'You are now subscribed to updates.',
      url: '/dashboard',
    });
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (error) {
      console.error('Error sending test notification:', error);
      // throw new Error('Failed to send test notification')
    }

    return { success: true };
  });
};
