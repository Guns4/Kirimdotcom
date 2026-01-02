import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid errors during static generation
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data, error } = await getSupabase().rpc('get_high_risk_transactions');

        if (error) throw error;

        return NextResponse.json({ alerts: data || [] });
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
        const { alert_id, action, notes } = body;

        if (!alert_id || !action) {
            return NextResponse.json({
                error: 'alert_id and action required'
            }, { status: 400 });
        }

        const updateData: any = {
            admin_notes: notes,
            resolved_at: new Date().toISOString()
        };

        if (action === 'APPROVE') {
            updateData.admin_override = 'APPROVED';
        } else if (action === 'REJECT') {
            updateData.admin_override = 'REJECTED';

            // TODO: Implement actual ban/refund logic here
        }

        const { error } = await getSupabase()
            .from('fraud_alerts')
            .update(updateData)
            .eq('id', alert_id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: action === 'APPROVE' ? 'Transaction approved' : 'Transaction rejected'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
