'use server';

import { MissionEngine } from '@/lib/mission-engine';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMissionsAction() {
    // Fix: Double await for createClient stability
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    return await MissionEngine.getDailyMissions(user.id);
}

export async function claimMissionAction(missionId: string) {
    // Fix: Double await for createClient stability
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    try {
        const res = await MissionEngine.claimMission(missionId, user.id);
        revalidatePath('/dashboard/missions');
        return { success: true, xp: res.xp };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
