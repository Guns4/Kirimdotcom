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
        const { trx_id, ref_id } = body;

        // 2. Validate Input
        if (!trx_id && !ref_id) {
            return h2hError('Please provide trx_id or ref_id');
        }

        // 3. Check Status (Mock)
        // In production: Lookup transaction in DB

        return h2hResponse({
            trx_id: trx_id || 'TRX-MOCK-Found',
            ref_id: ref_id || 'REF-MOCK-Found',
            service_code: 'PULSA10',
            target: '081234567890',
            status: 'SUCCESS',
            sn: '123456789012345', // Serial Number
            price: 10500,
            note: 'Topup Sukses'
        }, 'Transaction status retrieved');

    } catch (error) {
        return h2hError('Invalid request body');
    }
}
