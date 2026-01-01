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
        const { data: items, error } = await supabase
            .from('game_gacha_items')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;

        // Get total probability
        const { data: totalData } = await supabase.rpc('get_gacha_probability_total');
        const totalProbability = totalData || 0;

        return NextResponse.json({
            items: items || [],
            total_probability: totalProbability,
            is_valid: totalProbability === 100
        });
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
        const { action, item_id, updates } = body;

        if (action === 'UPDATE_PROBABILITY') {
            const { error } = await supabase
                .from('game_gacha_items')
                .update({
                    probability_percent: updates.probability_percent,
                    updated_at: new Date().toISOString()
                })
                .eq('id', item_id);

            if (error) throw error;

            // Log admin action
            await supabase.rpc('log_admin_action', {
                p_admin_id: null,
                p_action: 'UPDATE_GACHA_PROBABILITY',
                p_details: { item_id, ...updates },
                p_ip: req.headers.get('x-forwarded-for') || 'unknown'
            });

            return NextResponse.json({ success: true });
        } else if (action === 'EMERGENCY_STOP') {
            // Set all high-value items to 0% probability, increase zonk to 95%
            await supabase
                .from('game_gacha_items')
                .update({ probability_percent: 0 })
                .neq('type', 'ZONK');

            await supabase
                .from('game_gacha_items')
                .update({ probability_percent: 95 })
                .eq('type', 'ZONK');

            await supabase.rpc('log_admin_action', {
                p_admin_id: null,
                p_action: 'GACHA_EMERGENCY_STOP',
                p_details: { reason: 'Admin triggered emergency stop' },
                p_ip: req.headers.get('x-forwarded-for') || 'unknown'
            });

            return NextResponse.json({ success: true, message: 'Emergency stop activated!' });
        } else if (action === 'UPDATE_STOCK') {
            const { error } = await supabase
                .from('game_gacha_items')
                .update({
                    stock_limit: updates.stock_limit,
                    stock_remaining: updates.stock_remaining
                })
                .eq('id', item_id);

            if (error) throw error;

            return NextResponse.json({ success: true });
        } else if (action === 'TOGGLE_ACTIVE') {
            const { error } = await supabase
                .from('game_gacha_items')
                .update({ is_active: updates.is_active })
                .eq('id', item_id);

            if (error) throw error;

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
