import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function checkTOSAcceptance(userId: string) {
    const supabase = createClient();

    // 1. Get Latest Active TOS
    const { data: latestTos } = await supabase
        .from('tos_versions')
        .select('version')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

    if (!latestTos) return; // No TOS active, skip

    // 2. Get User's Accepted Version
    const { data: user } = await supabase
        .from('users')
        .select('last_accepted_tos_version')
        .eq('id', userId)
        .single();

    if (!user) return;

    // 3. Compare
    if (user.last_accepted_tos_version !== latestTos.version) {
        // Redirect to TOS Acceptance Page
        // MUST be called inside Server Component or Server Action
        redirect(`/legal/accept-tos?version=${latestTos.version}`);
    }
}
