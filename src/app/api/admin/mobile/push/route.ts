import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, message, target_type, target_user_id } = body;

        if (!title || !message) {
            return NextResponse.json({
                error: 'Title and message required'
            }, { status: 400 });
        }

        // TODO: Integrate with Firebase Cloud Messaging (FCM)
        // For now, we'll just log the notification

        // Placeholder FCM integration
        const fcmResponse = {
            status: 'placeholder',
            note: 'FCM integration required - install Firebase Admin SDK',
            would_send_to: target_type || 'ALL',
            message: {
                notification: {
                    title,
                    body: message
                }
            }
        };

        // Log notification
        const { data: log, error } = await supabase
            .from('push_notification_logs')
            .insert({
                title,
                body: message,
                target_type: target_type || 'ALL',
                target_user_id,
                fcm_response: fcmResponse,
                success_count: target_type === 'ALL' ? 999 : 1, // Placeholder
                failure_count: 0
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Notification logged (FCM integration pending)',
            log_id: log.id,
            fcm_response: fcmResponse
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: logs, error } = await supabase
            .from('push_notification_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ logs: logs || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
