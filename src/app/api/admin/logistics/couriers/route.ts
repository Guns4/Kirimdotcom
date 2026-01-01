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
        const { data: couriers, error } = await supabase
            .from('courier_configs')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ couriers: couriers || [] });
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
        const { courier_code, action, value } = body;

        if (!courier_code || !action) {
            return NextResponse.json({
                error: 'courier_code and action required'
            }, { status: 400 });
        }

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (action === 'TOGGLE_ACTIVE') {
            updateData.is_active = value;
        } else if (action === 'UPDATE_HEALTH') {
            updateData.health_status = value; // NORMAL, OVERLOAD, MAINTENANCE
        } else if (action === 'UPDATE_MARKUP') {
            updateData.admin_markup_percent = parseFloat(value);
        } else if (action === 'UPDATE_COD_FEE') {
            updateData.cod_fee_percent = parseFloat(value);
        }

        const { error } = await supabase
            .from('courier_configs')
            .update(updateData)
            .eq('code', courier_code);

        if (error) throw error;

        // Log admin action
        await supabase.rpc('log_admin_action', {
            p_admin_id: null,
            p_action: `COURIER_${action}`,
            p_details: { courier_code, ...updateData },
            p_ip: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ success: true, message: 'Courier updated' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
