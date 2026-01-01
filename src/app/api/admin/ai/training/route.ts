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

    try {
        const { data, error } = await supabase.rpc('get_pending_chat_reviews');

        if (error) throw error;

        return NextResponse.json({ chats: data || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { chat_id, admin_correction } = body;

        if (!chat_id || !admin_correction) {
            return NextResponse.json({
                error: 'chat_id and admin_correction required'
            }, { status: 400 });
        }

        const { error } = await supabase
            .from('ai_chat_history')
            .update({
                admin_correction,
                status: 'CORRECTED'
            })
            .eq('id', chat_id);

        if (error) throw error;

        // TODO: In production, add this to fine-tuning dataset

        return NextResponse.json({ success: true, message: 'Correction saved for training' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
