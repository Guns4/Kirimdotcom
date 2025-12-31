import { validateH2HRequest, successResponse, errorResponse } from '@/lib/h2h-auth';
import { createClient } from '@/utils/supabase/server';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    const { partner, body, errorResponse: authError } = await validateH2HRequest(request);
    if (authError) return authError;

    // Validate Body
    const { service_code, target, ref_id } = body || {};
    if (!service_code || !target || !ref_id) {
        return errorResponse('Missing service_code, target, or ref_id', 400);
    }

    const supabase = await createClient();
    const trxId = randomUUID();

    // 1. Check for Duplicate Ref ID for this Partner
    const { data: existing } = await (supabase as any)
        .from('h2h_transaction_logs')
        .select('id')
        .eq('partner_id', partner!.id)
        .eq('ref_id', ref_id)
        .single();

    if (existing) {
        return errorResponse('Duplicate ref_id', 409);
    }

    // 2. Perform Transaction Logic (Mocked)
    // In reality: Check balance -> Call Vendor -> Deduct Balance -> Save

    // Mock processing result
    const success = true; // Assume success for MVP
    const price = 1000; // Mock price

    // 3. Log Transaction
    await (supabase as any)
        .from('h2h_transaction_logs')
        .insert({
            partner_id: partner!.id,
            ref_id,
            trx_id: trxId,
            endpoint: 'TRX',
            request_payload: body,
            response_payload: { status: 'PENDING', message: 'Transaction processing' },
            status_code: 200,
            ip_address: request.headers.get('x-forwarded-for') || null
        });

    // 4. Return Pending/Success Response
    return successResponse({
        trx_id: trxId,
        ref_id,
        status: 'PROCESSING', // Async processing is better for H2H
        price,
        balance_remaining: 99999 // Mock
    });
}
