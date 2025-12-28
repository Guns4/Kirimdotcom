import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/utils/supabase/server';

if (process.env.VAPID_EMAIL && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL}`,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function POST(request: Request) {
    try {
        const { resi, status, message } = await request.json();

        if (!resi) {
            return NextResponse.json({ error: 'Resi is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get subscribers watching this resi
        // Ensure 'resi_watchers' table exists and links user_id to resi
        const { data: watchers, error: watchersError } = await supabase
            .from('resi_watchers')
            .select('user_id')
            .eq('resi', resi);

        if (watchersError) {
            console.error('Error fetching watchers:', watchersError);
            return NextResponse.json({ error: 'Database error fetching watchers' }, { status: 500 });
        }

        const userIds = watchers?.map(w => w.user_id).filter(Boolean) || [];

        if (userIds.length === 0) {
            return NextResponse.json({ sent: 0, message: 'No watchers found' });
        }

        // Get push subscriptions
        const { data: subscriptions, error: subsError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .in('user_id', userIds);

        if (subsError) {
            console.error('Error fetching subscriptions:', subsError);
            return NextResponse.json({ error: 'Database error fetching subscriptions' }, { status: 500 });
        }

        // Send push to all subscribers
        const notifications = subscriptions?.map(sub =>
            webpush.sendNotification(
                { endpoint: sub.endpoint, keys: sub.keys },
                JSON.stringify({
                    title: `Update Resi ${resi}`,
                    body: message || `Status update: ${status}`,
                    url: `/cek-resi/${resi}`,
                    resi,
                    timestamp: new Date().toISOString()
                })
            ).catch(err => {
                console.error(`Error sending push to ${sub.endpoint}:`, err);
                if (err.statusCode === 410) {
                    // Subscription expired, consider deleting from DB
                    // await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                }
                return null; // Return null for failed requests to handle in Promise.all
            })
        ) || [];

        const results = await Promise.allSettled(notifications);
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;

        return NextResponse.json({ sent: successCount, total_attempted: notifications.length });
    } catch (error) {
        console.error('Error in send route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
