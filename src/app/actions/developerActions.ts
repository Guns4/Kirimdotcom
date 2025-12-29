'use server';

import { createClient } from '@/utils/supabase/server';
import { generateSecret, hashKey } from '@/lib/api-security';
import { revalidatePath } from 'next/cache';

export async function createApiKey(label: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    // 1. Generate Secret
    const rawKey = generateSecret();
    const hashed = hashKey(rawKey);
    const prefix = rawKey.substring(0, 8) + '...';

    // 2. Store Hash Only
    const { error } = await (supabase.from('api_keys') as any).insert({
        user_id: user.id,
        key_hash: hashed,
        key_prefix: prefix,
        label: label || 'Untitled Key',
        is_active: true
    });

    if (error) {
        console.error('Create API Key Error:', error);
        return { error: 'Failed to create key' };
    }

    revalidatePath('/dashboard/developer');

    // 3. Return Raw Key (ONLY ONCE)
    return { success: true, secretKey: rawKey };
}

export async function revokeApiKey(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await (supabase
        .from('api_keys') as any)
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: 'Failed to revoke key' };

    revalidatePath('/dashboard/developer');
    return { success: true };
}

export async function getKeys() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await (supabase
        .from('api_keys') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return data || [];
}
