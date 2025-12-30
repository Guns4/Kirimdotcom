'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitFeature(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    const { error } = await (supabase as any).from('feature_requests').insert({
        user_id: user.id,
        title,
        description
    });

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard'); // Update widget
}

export async function voteFeature(requestId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Must be logged in');

    // Optimistic check done by database constraints, but we can catch here
    const { error } = await (supabase as any).from('feature_votes').insert({
        user_id: user.id,
        request_id: requestId
    });

    if (error) {
        // If duplicate, maybe toggle (unvote)? For now, just error or ignore.
        console.error(error);
    }
    revalidatePath('/dashboard');
}
