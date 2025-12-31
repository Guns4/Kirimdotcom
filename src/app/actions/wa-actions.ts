'use server';

import { WASessionManager } from '@/lib/wa-session-manager';
import { createClient } from '@/utils/supabase/server';

export async function connectWAAction() {
    // Fix: Double await for createClient stability
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    try {
        const result = await WASessionManager.createSession(user.id);
        // JSON cannot serialize Error objects or complex types, ensure simple return
        return JSON.parse(JSON.stringify(result));
    } catch (e: any) {
        return { error: e.message || 'Connection failed' };
    }
}
