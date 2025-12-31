// OneSignal Service
// Server-side logic for sending Push Notifications

// Note: In a real app, use the official 'onesignal-node' library.
// For this setup, we will use fetch for zero-dependency bloat in the setup script for now, 
// or imply the user installs it. let's use standard fetch to be safe and lightweight.

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || '';
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY || '';

interface NotificationPayload {
    title: string;
    message: string;
    url?: string; // Deep link URL
    data?: any;
}

export async function sendNotificationToUser(userId: string, payload: NotificationPayload) {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
        console.warn('[OneSignal] Missing credentials. Notification skipped.');
        return;
    }

    console.log(`[OneSignal] Sending to User: ${userId}`, payload);

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                include_external_user_ids: [userId], // Targeting by internal User ID
                headings: { en: payload.title },
                contents: { en: payload.message },
                url: payload.url, // Deep link support
                data: payload.data
            })
        });

        const result = await response.json();
        console.log('[OneSignal] Result:', result);
        return result;
    } catch (error) {
        console.error('[OneSignal] Error:', error);
        return null;
    }
}

export async function broadcastNotification(payload: NotificationPayload) {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) return;

    console.log(`[OneSignal] BROADCASTING`, payload);

    try {
        await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                included_segments: ['Subscribed Users'], // All Active Users
                headings: { en: payload.title },
                contents: { en: payload.message },
                url: payload.url,
                data: payload.data
            })
        });
    } catch (error) {
        console.error('[OneSignal] Broadcast Error:', error);
    }
}

// Triggers Implementation

// 1. Tracking Update
export async function notifyTrackingUpdate(userId: string, resi: string, newStatus: string) {
    const title = '📦 Update Resi';
    let message = `Paket ${resi} statusnya berubah menjadi ${newStatus}.`;

    if (newStatus === 'DELIVERED') {
        message = `✅ Paket ${resi} telah SAMPAI tujuan!`;
    }

    await sendNotificationToUser(userId, {
        title,
        message,
        url: `/dashboard/tracking/${resi}` // Deep Link
    });
}

// 2. Balance Update
export async function notifyBalanceUpdate(userId: string, amount: number, type: 'IN' | 'OUT') {
    const formatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    const title = type === 'IN' ? '💰 Saldo Masuk' : '💸 Saldo Keluar';
    const message = `Sukses ${type === 'IN' ? 'Topup' : 'Pembayaran'} sebesar ${formatted}`;

    await sendNotificationToUser(userId, {
        title,
        message,
        url: '/dashboard/wallet' // Deep Link
    });
}
