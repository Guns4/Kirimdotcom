import { NextRequest } from 'next/server';
import { validateH2HRequest, h2hResponse, h2hError } from '@/lib/h2h-auth';

export async function POST(req: NextRequest) {
    // 1. Validate Auth
    const auth = await validateH2HRequest();
    if (!auth.isValid) {
        return h2hError(auth.error || 'Unauthorized', auth.status);
    }

    try {
        const body = await req.json();
        const { service_code, target, ref_id } = body;

        // 2. Validate Input
        if (!service_code || !target || !ref_id) {
            return h2hError('Missing required fields: service_code, target, ref_id');
        }

        // 3. Process Transaction (Mock)
        // In production: Lookup service, check balance, call provider, deduct balance
        console.log(`[H2H] TRX Request: ${service_code} -> ${target} (Ref: ${ref_id})`);

        // Mock Success Response
        const trxId = `TRX-${Date.now()}`;

        return h2hResponse({
            trx_id: trxId,
            ref_id: ref_id,
            service_code: service_code,
            target: target,
            status: 'PENDING', // Async process usually returns PENDING
            price: 10500,
            balance_after: 1489500,
            note: 'Transaction processed successfully'
        });

    } catch (error) {
        return h2hError('Invalid request body');
    }
}
