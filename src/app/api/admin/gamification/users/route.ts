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
        const { data: badges, error } = await supabase
            .from('game_badges')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ badges: badges || [] });
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
        const { action, user_id, badge_id, badge_data, points_adjustment } = body;

        if (action === 'ASSIGN_BADGE') {
            // Assign badge to user
            const { error } = await supabase
                .from('user_badges')
                .insert({
                    user_id,
                    badge_id
                });

            if (error) throw error;

            return NextResponse.json({
                success: true,
                message: 'Badge assigned to user'
            });
        } else if (action === 'CREATE_BADGE') {
            // Create new badge
            const { data, error } = await supabase
                .from('game_badges')
                .insert(badge_data)
                .select()
                .single();

            if (error) throw error;

            return NextResponse.json({
                success: true,
                badge: data
            });
        } else if (action === 'ADJUST_POINTS') {
            // Manual points adjustment (add to user wallet or loyalty points)
            // This would integrate with your existing points/wallet system

            // Placeholder implementation
            return NextResponse.json({
                success: true,
                message: 'Points adjusted (integrate with wallet system)'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
