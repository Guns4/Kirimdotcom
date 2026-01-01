import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_TABLES = ['users', 'orders', 'transactions', 'products', 'api_keys'];

export async function GET(req: Request) {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const table = searchParams.get('table');

        if (!table || !ALLOWED_TABLES.includes(table)) {
            return NextResponse.json({
                error: 'Invalid table. Allowed: ' + ALLOWED_TABLES.join(', ')
            }, { status: 400 });
        }

        // Fetch data from table
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(10000); // Safety limit

        if (error) throw error;

        // Convert to CSV
        if (!data || data.length === 0) {
            return new Response('No data available', {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','), // Header row
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Escape commas and quotes
                    if (value === null || value === undefined) return '';
                    const stringValue = String(value).replace(/"/g, '""');
                    return stringValue.includes(',') || stringValue.includes('"')
                        ? `"${stringValue}"`
                        : stringValue;
                }).join(',')
            )
        ];

        const csvContent = csvRows.join('\n');

        // Log export action
        await supabase.rpc('log_admin_action', {
            p_admin_id: null,
            p_action: 'EXPORT_DATA',
            p_details: { table, row_count: data.length },
            p_ip: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${table}_export_${Date.now()}.csv"`
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
