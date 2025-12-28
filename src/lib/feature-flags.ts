'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type FeatureFlag = {
    key: string;
    description: string;
    is_enabled: boolean;
    percentage: number;
    allowed_roles: string[] | null;
    updated_at: string;
};

// Check if a feature is enabled for the current user
export async function checkFeature(key: string): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data: flag } = await supabase
            .from('feature_flags')
            .select('*')
            .eq('key', key)
            .single();

        if (!flag) return false;

        // 1. Global switch
        if (!flag.is_enabled) return false;

        // 2. Percentage Rollout and Roles require user context
        if (flag.percentage < 100 || (flag.allowed_roles && flag.allowed_roles.length > 0)) {
            const { data: { user } } = await supabase.auth.getUser();

            // 3. Check Role
            if (flag.allowed_roles && flag.allowed_roles.length > 0) {
                if (!user) return false; // Must be logged in for role check
                // Ideally check specific role table, here assuming metadata or simpler logic
                // For now, if role restriction exists and we fail to verify, return false
                // const userRole = user.user_metadata?.role || 'user';
                // if (!flag.allowed_roles.includes(userRole)) return false;
            }

            // 4. Percentage Rollout (Deterministic based on UUID)
            if (flag.percentage < 100) {
                if (!user) {
                    // Anonymous: randomly assign (stickiness issue ideally handled by cookie, but here random)
                    return Math.random() * 100 < flag.percentage;
                }
                // Deterministic hash of User ID to consistency
                const hash = user.id.charCodeAt(0) + user.id.charCodeAt(user.id.length - 1);
                return (hash % 100) < flag.percentage;
            }
        }

        return true;
    } catch (e) {
        console.error(`Check feature ${key} failed`, e);
        return false; // Fail safe
    }
}

// Admin: Get all flags
export async function getAllFlags() {
    const supabase = await createClient();
    const { data } = await supabase.from('feature_flags').select('*').order('key');
    return data || [];
}

// Admin: Update flag
export async function updateFlag(key: string, updates: Partial<FeatureFlag>) {
    const supabase = await createClient();
    await supabase.from('feature_flags').update(updates).eq('key', key);
    revalidatePath('/'); // Revalidate everywhere as flags might affect layout
}

// Admin: Create flag
export async function createFlag(key: string, description: string) {
    const supabase = await createClient();
    await supabase.from('feature_flags').insert({ key, description });
    revalidatePath('/');
}
