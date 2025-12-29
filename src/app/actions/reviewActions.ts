'use server';

import { createClient } from '@/utils/supabase/server';

export interface VerificationResult {
    isVerified: boolean;
    lastTrackingDate?: string;
}

export async function verifyReviewEligibility(courierCode: string): Promise<VerificationResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { isVerified: false };

    // Check tracking history for this courier in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // specific casting to any to avoid type errors if tracking_history is not yet typed
    const { data, error } = await (supabase
        .from('tracking_history') as any)
        .select('created_at')
        .eq('user_id', user.id)
        .eq('courier_code', courierCode) // Ensure courier_code column exists in tracking_history
        .gte('created_at', thirtyDaysAgo)
        .limit(1)
        .single();

    if (error || !data) {
        return { isVerified: false };
    }

    return {
        isVerified: true,
        lastTrackingDate: data.created_at
    };
}
