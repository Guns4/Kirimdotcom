import { validateH2HRequest, h2hResponse, h2hError } from '@/lib/h2h-auth';

export async function POST() {
    // 1. Validate Auth
    const auth = await validateH2HRequest();
    if (!auth.isValid) {
        return h2hError(auth.error || 'Unauthorized', auth.status);
    }

    // 2. Get Balance (Mock)
    const mockBalance = 1500000;

    return h2hResponse({
        balance: mockBalance,
        currency: 'IDR',
        formatted: 'Rp 1.500.000'
    }, 'Balance retrieved successfully');
}
