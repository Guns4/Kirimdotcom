'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// 1. Export Data (JSON)
export async function exportUserData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Fetch aggregation of data
    const { data: profile } = await (supabase as any).from('profiles').select('*').eq('id', user.id).single();
    const { data: transactions } = await (supabase as any).from('transactions').select('*').eq('user_id', user.id);
    const { data: consents } = await (supabase as any).from('privacy_consent_logs').select('*').eq('user_id', user.id);
    const { data: pointHistory } = await (supabase as any).from('point_history').select('*').eq('user_id', user.id);

    const fullExport = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        profile,
        transactions,
        point_history: pointHistory,
        consents
    };

    return fullExport;
}

// 2. Delete Account (Anonymize & Hard Delete)
export async function deleteUserAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // A. Anonymize Operational Data first (SQL Function)
    const { error: anonError } = await (supabase as any).rpc('anonymize_user_data', { p_user_id: user.id });
    if (anonError) {
        console.error('Anonymization failed:', anonError);
        throw new Error('Gagal memproses permintaan hapus akun.');
    }

    // B. Note: Actual user deletion requires service role or admin function
    // In production, this would trigger an admin-level deletion workflow
    // For now, we just anonymize the data

    return { success: true };
}

// 3. Log Consent
export async function logConsent(version: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get IP (Basic attempt, simpler in Edge Function)
    const ip = 'masked';

    await (supabase as any).from('privacy_consent_logs').insert({
        user_id: user.id,
        agreement_version: version,
        ip_address: ip
    });

    revalidatePath('/settings');
}
