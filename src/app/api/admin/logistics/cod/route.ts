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
        const status = searchParams.get('status');

        let query = supabase
            .from('cod_reconciliations')
            .select(`
        *,
        courier_configs(name, code)
      `)
            .order('transfer_date', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: reconciliations, error } = await query;

        if (error) throw error;

        return NextResponse.json({ reconciliations: reconciliations || [] });
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
        const { courier_code, transfer_date, total_amount, file_url, csv_data } = body;

        if (!courier_code || !transfer_date || !total_amount) {
            return NextResponse.json({
                error: 'courier_code, transfer_date, and total_amount required'
            }, { status: 400 });
        }

        // Create reconciliation record
        const { data: reconciliation, error: reconError } = await supabase
            .from('cod_reconciliations')
            .insert({
                courier_code,
                transfer_date,
                total_amount,
                file_url,
                status: 'UNMATCHED'
            })
            .select()
            .single();

        if (reconError) throw reconError;

        // Process CSV data if provided
        if (csv_data && Array.isArray(csv_data)) {
            const items = csv_data.map((row: any) => ({
                reconciliation_id: reconciliation.id,
                tracking_number: row.tracking_number || row.resi,
                expected_amount: parseFloat(row.amount || 0),
                actual_amount: parseFloat(row.amount || 0),
                status: 'MATCHED' // Default, will be verified against orders
            }));

            const { error: itemsError } = await supabase
                .from('cod_reconciliation_items')
                .insert(items);

            if (itemsError) throw itemsError;

            // Calculate reconciliation summary
            await supabase.rpc('calculate_cod_reconciliation', {
                p_reconciliation_id: reconciliation.id
            });
        }

        return NextResponse.json({
            success: true,
            reconciliation_id: reconciliation.id,
            message: 'COD reconciliation created'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { reconciliation_id, action } = body;

        if (!reconciliation_id || !action) {
            return NextResponse.json({
                error: 'reconciliation_id and action required'
            }, { status: 400 });
        }

        if (action === 'COMPLETE') {
            // Mark as completed and trigger seller payouts
            const { error } = await supabase
                .from('cod_reconciliations')
                .update({
                    status: 'COMPLETED',
                    processed_at: new Date().toISOString()
                })
                .eq('id', reconciliation_id);

            if (error) throw error;

            // TODO: Trigger seller payout logic here

            return NextResponse.json({
                success: true,
                message: 'COD disbursement completed'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
