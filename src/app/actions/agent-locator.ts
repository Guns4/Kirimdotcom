'use server';

import { createClient } from '@/utils/supabase/server';


export interface AgentSubmission {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
}

export async function submitNewAgent(data: AgentSubmission) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Validation
    if (!data.name || !data.address) {
        return { success: false, message: 'Nama dan Alamat wajib diisi.' };
    }

    // 2. Mock Saving (or Real DB if table exists)
    // For this "Utility" phase, assuming we might not have 'agents' table yet, so we'll mock success
    // or insert into a generic 'feedback' or 'submissions' table if available.

    // Attempt to insert into 'agent_submissions' (generic fallback)
    /*
    const { error } = await supabase.from('agent_submissions').insert({
      user_id: user?.id,
      ...data,
      status: 'PENDING'
    });
    */

    // SIMULATION DELAY
    await new Promise(resolve => setTimeout(resolve, 800));

    // 3. Reward Logic (Gamification)
    if (user) {
        // Add Points (Mock or Real)
        // await supabase.rpc('add_user_points', { user_id: user.id, points: 50 });
    }

    // 4. Return Success
    return {
        success: true,
        message: 'Terima kasih! Lokasi Agen berhasil dikirim.',
        pointsEarned: 50
    };
}
