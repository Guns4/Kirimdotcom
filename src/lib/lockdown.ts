import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function isSystemLocked(): Promise<boolean> {
    // 1. Check Cookie (Fastest - Cache for 1 min)
    const cookieStore = await cookies();
    const cachedLock = cookieStore.get('sys_lock')?.value;
    if (cachedLock === 'true') return true;
    if (cachedLock === 'false') return false;

    // 2. Check DB
    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'system_lockdown')
            .single();

        const isLocked = data?.value === true;
        return isLocked;
    } catch (e) {
        return false; // Fail open
    }
}

export async function toggleLockdown(locked: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Verify Admin (Optional double check)

    const { error } = await supabase
        .from('system_settings')
        .update({
            value: locked,
            updated_at: new Date().toISOString(),
            updated_by: user.id
        })
        .eq('key', 'system_lockdown');

    if (error) throw error;
    return true;
}
