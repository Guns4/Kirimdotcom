import { createClient } from '@/utils/supabase/server';

export const LEVELS = [
    { level: 1, min_xp: 0, name: 'Garasi Rumah', perk: 'Starter Pack' },
    { level: 2, min_xp: 100, name: 'Garasi Rumah (Upgraded)', perk: 'None' },
    { level: 3, min_xp: 300, name: 'Toko Kecil', perk: 'Diskon 5%' },
    { level: 4, min_xp: 600, name: 'Toko Kecil (Ramai)', perk: 'Skin: Blue Truck' },
    { level: 5, min_xp: 1000, name: 'Gudang Sedang', perk: 'Prioritas CS' },
    { level: 6, min_xp: 1500, name: 'Gudang Sedang (Full)', perk: 'Diskon 10%' },
    { level: 7, min_xp: 2200, name: 'Gudang Besar', perk: 'Skin: Gold Truck' },
    { level: 8, min_xp: 3000, name: 'Gudang Besar (Automated)', perk: 'Analisis Bisnis' },
    { level: 9, min_xp: 4000, name: 'Gudang Raksasa', perk: 'Diskon 15%' },
    { level: 10, min_xp: 5500, name: 'Gudang Raksasa (Sultan)', perk: 'ALL FREE ADMIN FEES' },
];

export const XP_SOURCES = {
    SHIPMENT: 10,
    ROUTE_OPTIMIZATION: 50,
    REFERRAL: 200,
    DAILY_LOGIN: 5
};

export const TycoonEngine = {
    async getProfile(userId: string) {
        // Fix: Double await for createClient stability
        const supabasePromise = await createClient();
        const supabase = await supabasePromise;

        const { data } = await (supabase as any)
            .from('tycoon_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!data) {
            // Initialize if not exists
            const { data: newData, error: initError } = await (supabase as any)
                .from('tycoon_profiles')
                .insert({ user_id: userId })
                .select()
                .single();

            if (initError) throw initError;
            return newData;
        }

        return data;
    },

    async awardXP(userId: string, amount: number, source: string) {
        // Fix: Double await for createClient stability
        const supabasePromise = await createClient();
        const supabase = await supabasePromise;

        // 1. Get Current XP
        const profile = await this.getProfile(userId);
        const newXP = (profile.xp || 0) + amount;

        // 2. Calculate New Level
        let newLevel = profile.level;
        // Find highest level where newXP >= min_xp
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (newXP >= LEVELS[i].min_xp) {
                newLevel = LEVELS[i].level;
                break;
            }
        }

        // 3. Update Profile
        const updates: any = { xp: newXP, updated_at: new Date().toISOString() };
        if (newLevel > profile.level) {
            updates.level = newLevel;
            updates.warehouse_name = LEVELS.find(l => l.level === newLevel)?.name || profile.warehouse_name;
            // Add perks/unlocks logic here if needed
        }

        const { error } = await (supabase as any)
            .from('tycoon_profiles')
            .update(updates)
            .eq('user_id', userId);

        if (error) throw error;

        // 4. Log Transaction
        await (supabase as any).from('tycoon_logs').insert({
            user_id: userId,
            xp_amount: amount,
            source: source
        });

        return { success: true, newLevel, newXP };
    }
};
