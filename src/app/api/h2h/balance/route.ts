import { validateH2HRequest, successResponse, errorResponse } from '@/lib/h2h-auth';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const { partner, errorResponse: authError } = await validateH2HRequest(request);
    if (authError) return authError;

    const supabase = await createClient();

    // Fetch Balance
    const { data: user, error } = await (supabase as any)
        .from('users')
        .select('balance')
        .eq('id', partner!.user_id)
        .single();

    if (error || !user) {
        return errorResponse('User account not found', 404);
    }

    return successResponse({
        balance: user.balance,
        currency: 'IDR'
    });
}
