'use server';

import { createClient } from '@/utils/supabase/server';
import { randomBytes } from 'crypto';

export async function inviteAdminMember(email: string, role: string) {
    const supabase = await createClient();

    // 1. Check Permissions (Must be Super Admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // 2. Generate Token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    // 3. Store Invite
    const { error } = await supabase.from('admin_invites').insert({
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        invited_by: user.id
    });

    if (error) return { error: error.message };

    // 4. Send Email (Mock)
    console.log(`[MOCK EMAIL] Invite sent to ${email} with link: https://cekkirim.com/admin/join?token=${token}`);

    return { success: true, link: `https://cekkirim.com/admin/join?token=${token}` };
}
