import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get users with wallet balance and status
    const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, wallet_balance, created_at, is_banned, ban_reason, failed_pin_attempts, last_login_at, last_login_ip')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to 100 recent users for performance

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
