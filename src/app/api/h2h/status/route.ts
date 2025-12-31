import { validateH2HRequest, successResponse, errorResponse } from '@/lib/h2h-auth';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const { partner, body, errorResponse: authError } = await validateH2HRequest(request);
    if (authError) return authError;

    if (!body || !body.trx_id && !body.ref_id) {
        return errorResponse('Missing trx_id or ref_id', 400);
    }

    const supabase = await createClient();

    // Query Transaction Log or your main transaction table
    let query = (supabase as any)
        .from('h2h_transaction_logs')
        .select('*');

    if (body.trx_id) {
        query = query.eq('trx_id', body.trx_id);
    } else {
        query = query.eq('ref_id', body.ref_id).eq('partner_id', partner!.id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
        return errorResponse('Transaction not found', 404);
    }

    // Return the stored status or payload
    return successResponse({
        trx_id: data.trx_id,
        ref_id: data.ref_id,
        status: data.status_code === 200 ? 'SUCCESS' : 'FAILED', // Simplified status mapping
        details: data.response_payload
    });
}
