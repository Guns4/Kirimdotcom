import { NextRequest, NextResponse } from 'next/server';
import { authenticateApi, apiError } from '@/lib/api-auth';

// Force dynamic needed to read headers/IP
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 1. Authenticate & Charge (e.g., 50 Rupiah per call)
    const auth = await authenticateApi(req, 50);

    if (!auth.success) {
        return apiError(auth.error || 'Unauthorized', auth.code || 401);
    }

    // 2. Business Logic
    const data = {
        message: 'Hello Developer!',
        timestamp: new Date().toISOString(),
        subscription: {
            plan: 'Pay-as-you-go',
            remaining_balance: auth.remaining_balance
        }
    };

    return NextResponse.json({ success: true, data });
}
