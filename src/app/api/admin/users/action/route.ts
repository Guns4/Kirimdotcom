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

    const { user_id, action, reason } = await req.json();

    if (!user_id || !action) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        if (action === 'BAN') {
            // Ban user
            await supabase
                .from('users')
                .update({ is_banned: true, ban_reason: reason || 'Banned by admin' })
                .eq('id', user_id);

            // Log the action
            await supabase.from('system_logs').insert({
                level: 'WARNING',
                event_type: 'USER_BANNED',
                message: `User ${user_id} banned by Admin. Reason: ${reason || 'No reason provided'}`,
                user_id: user_id,
            });
        }
        else if (action === 'UNBAN') {
            // Unban user
            await supabase
                .from('users')
                .update({ is_banned: false, ban_reason: null })
                .eq('id', user_id);

            // Log the action
            await supabase.from('system_logs').insert({
                level: 'INFO',
                event_type: 'USER_UNBANNED',
                message: `User ${user_id} unbanned by Admin`,
                user_id: user_id,
            });
        }
        else if (action === 'RESET_PIN') {
            // Reset PIN attempts and unlock
            await supabase
                .from('users')
                .update({ failed_pin_attempts: 0, pin_locked_until: null })
                .eq('id', user_id);

            // Log the action
            await supabase.from('system_logs').insert({
                level: 'INFO',
                event_type: 'PIN_RESET',
                message: `PIN attempts reset for user ${user_id} by Admin`,
                user_id: user_id,
            });
        }
        else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
