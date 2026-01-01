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
        const { searchParams } = new URL(req.url);
        const issue_type = searchParams.get('type');
        const status = searchParams.get('status') || 'OPEN';

        let query = supabase
            .from('shipment_issues')
            .select(`
        *,
        courier_configs(name, code)
      `)
            .order('created_at', { ascending: false });

        if (issue_type) {
            query = query.eq('issue_type', issue_type);
        }

        if (status !== 'ALL') {
            query = query.eq('resolution_status', status);
        }

        const { data: issues, error } = await query;

        if (error) throw error;

        return NextResponse.json({ issues: issues || [] });
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
        const { action, issue_id, resolution_notes, compensation_amount } = body;

        if (!action || !issue_id) {
            return NextResponse.json({
                error: 'action and issue_id required'
            }, { status: 400 });
        }

        const updateData: any = {};

        if (action === 'RESOLVE') {
            updateData.resolution_status = 'RESOLVED';
            updateData.resolution_notes = resolution_notes;
            updateData.compensation_amount = compensation_amount;
            updateData.resolved_at = new Date().toISOString();
        } else if (action === 'CLOSE') {
            updateData.resolution_status = 'CLOSED';
        } else if (action === 'PROGRESS') {
            updateData.resolution_status = 'IN_PROGRESS';
        }

        const { error } = await supabase
            .from('shipment_issues')
            .update(updateData)
            .eq('id', issue_id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Issue ${action.toLowerCase()}d successfully`
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
