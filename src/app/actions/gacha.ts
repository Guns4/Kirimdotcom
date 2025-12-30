'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const GACHA_COST = 10;

interface GachaResult {
    success: boolean;
    rewardType?: 'zonk' | 'points' | 'pulsa' | 'jackpot';
    rewardValue?: number;
    rewardLabel?: string;
    newBalance?: number;
    error?: string;
}

export async function playGacha(): Promise<GachaResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // 1. Transaction: Deduct Cost
    const { data: deductRes, error: deductError } = await (supabase as any).rpc('award_points', {
        p_user_id: user.id,
        p_points: -GACHA_COST,
        p_action_type: 'play_gacha',
        p_description: 'Spin Gacha Cost'
    });

    // If error (likely insufficient balance)
    if (deductError || (deductRes && !deductRes.success)) {
        return { success: false, error: 'Poin tidak cukup!' };
    }

    // 2. RNG Logic (Server Side)
    const rand = Math.random() * 100; // 0 to 100
    let rewardType: 'zonk' | 'points' | 'pulsa' | 'jackpot' = 'zonk';
    let rewardValue = 0;
    let rewardLabel = 'Zonk! Coba lagi.';

    // Weights: 
    // Zonk: 70% (0 - 70)
    // Points: 20% (70 - 90)
    // Pulsa: 9.9% (90 - 99.9)
    // Jackpot: 0.1% (> 99.9)

    if (rand < 70) {
        // ZONK
        rewardType = 'zonk';
        rewardLabel = 'Zonk! Jangan menyerah!';
    } else if (rand < 90) {
        // POINTS: 5 to 50
        rewardType = 'points';
        rewardValue = Math.floor(Math.random() * (50 - 5 + 1)) + 5;
        rewardLabel = `+${rewardValue} Poin`;

        // Grant Prize
        await (supabase as any).rpc('award_points', {
            p_user_id: user.id,
            p_points: rewardValue,
            p_action_type: 'gacha_win',
            p_description: 'Gacha Win: Points'
        });

    } else if (rand < 99.9) {
        // PULSA (Simulated Item)
        rewardType = 'pulsa';
        rewardLabel = 'Voucher Pulsa 5rb';
        // In real app: Insert into 'user_vouchers' table
    } else {
        // JACKPOT
        rewardType = 'jackpot';
        rewardValue = 1000;
        rewardLabel = 'JACKPOT! 1000 Poin';

        await (supabase as any).rpc('award_points', {
            p_user_id: user.id,
            p_points: rewardValue,
            p_action_type: 'gacha_jackpot',
            p_description: 'JACKPOT WIN'
        });
    }

    // 3. Log History
    await (supabase as any).from('gacha_history').insert({
        user_id: user.id,
        reward_type: rewardType,
        reward_value: rewardValue,
        reward_label: rewardLabel,
        cost: GACHA_COST
    });

    // Get final balance
    const { data: profile } = await (supabase as any).from('profiles').select('points_balance').eq('id', user.id).single();

    revalidatePath('/rewards');
    return {
        success: true,
        rewardType,
        rewardValue,
        rewardLabel,
        newBalance: profile?.points_balance || 0
    };
}
