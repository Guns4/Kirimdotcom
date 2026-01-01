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
        const action = searchParams.get('action');

        if (action === 'CALCULATE') {
            // Calculate RFM scores for all users
            const { data: rfmData, error: rfmError } = await supabase.rpc('calculate_rfm_segments');

            if (rfmError) throw rfmError;

            // Upsert into marketing_rfm_segments table
            // (In production, this would be done by a background job)

            return NextResponse.json({
                success: true,
                message: 'RFM calculation completed',
                segments_calculated: rfmData?.length || 0
            });
        }

        // Get segment distribution
        const { data: distribution, error } = await supabase.rpc('get_segment_distribution');

        if (error) throw error;

        // Get recent segments
        const { data: segments } = await supabase
            .from('marketing_rfm_segments')
            .select('*')
            .order('total_spent', { ascending: false })
            .limit(100);

        return NextResponse.json({
            distribution: distribution || [],
            top_users: segments || []
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
