'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitUnboxingReview(data: {
    resi_number: string;
    video_url: string;
    rating: number;
    review_text: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await (supabase as any).from('unboxing_reviews').insert({
        resi_number: data.resi_number,
        video_url: data.video_url,
        rating: data.rating,
        review_text: data.review_text,
        user_id: user.id,
        is_approved: true, // Auto-approve for demo, change to false for prod
    });

    if (error) {
        console.error('Submit review error:', error);
        return { error: 'Gagal menyimpan review.' };
    }

    revalidatePath('/cek-resi');
    return { success: true };
}

export async function getRelatedVideos(resi_number: string) {
    const supabase = await createClient();

    // Logic: Get videos for this courier or just recent approved videos
    const { data } = await (supabase as any)
        .from('unboxing_reviews')
        .select('*, profiles(full_name, avatar_url)') // Assuming profiles relation
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6);

    return data || [];
}
