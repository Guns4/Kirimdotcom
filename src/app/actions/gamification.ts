'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// ============================================
// GAMIFICATION SERVER ACTIONS
// ============================================

// XP Point values for activities
export const XP_VALUES = {
  CHECK_RESI: 1,
  CHECK_ONGKIR: 1,
  WRITE_REVIEW: 5,
  SHARE_SOCIAL: 10,
  RATE_COURIER: 2,
  FIRST_DAILY_LOGIN: 3,
  COMPLETE_PROFILE: 20,
  REFER_FRIEND: 50,
} as const;

export type XPActivityType = keyof typeof XP_VALUES;

// Rank definitions
export const RANKS = {
  SCOUT: {
    name: 'Scout',
    minXP: 0,
    maxXP: 50,
    icon: '🔰',
    color: 'text-gray-400',
    bgColor: 'bg-gray-600/20',
  },
  NAVIGATOR: {
    name: 'Navigator',
    minXP: 51,
    maxXP: 200,
    icon: '🧭',
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/20',
  },
  MASTER: {
    name: 'Logistics Master',
    minXP: 201,
    maxXP: null,
    icon: '🏆',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-600/20',
  },
} as const;

export type RankName = (typeof RANKS)[keyof typeof RANKS]['name'];

// Get rank from XP
export function getRankFromXP(xp: number) {
  if (xp >= RANKS.MASTER.minXP) return RANKS.MASTER;
  if (xp >= RANKS.NAVIGATOR.minXP) return RANKS.NAVIGATOR;
  return RANKS.SCOUT;
}

// Calculate progress to next rank
export function getProgressToNextRank(xp: number) {
  const currentRank = getRankFromXP(xp);

  if (currentRank.name === 'Logistics Master') {
    return { percent: 100, xpNeeded: 0, nextRank: null };
  }

  const nextRank =
    currentRank.name === 'Scout' ? RANKS.NAVIGATOR : RANKS.MASTER;
  const xpInCurrentRank = xp - currentRank.minXP;
  const xpNeededForNext = nextRank.minXP - currentRank.minXP;
  const percent = Math.min(
    100,
    Math.round((xpInCurrentRank / xpNeededForNext) * 100)
  );

  return {
    percent,
    xpNeeded: nextRank.minXP - xp,
    nextRank,
  };
}

// ============================================
// SERVER ACTIONS
// ============================================

interface AddXPResult {
  success: boolean;
  newXP?: number;
  oldRank?: string;
  newRank?: string;
  rankChanged?: boolean;
  premiumGranted?: boolean;
  error?: string;
}

/**
 * Add XP to user for an activity
 */
export async function addUserXP(
  activityType: XPActivityType,
  description?: string
): Promise<AddXPResult> {
  try {
    const supabase = await createClient(cookies());

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const xpAmount = XP_VALUES[activityType];

    // Call the database function
    const { data, error } = await supabase.rpc('add_user_xp', {
      p_user_id: user.id,
      p_activity_type: activityType,
      p_xp_amount: xpAmount,
      p_description: description || `Earned ${xpAmount} XP for ${activityType}`,
    });

    if (error) {
      console.error('Error adding XP:', error);

      // Fallback: Update directly if function doesn't exist
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp_points, current_rank')
        .eq('id', user.id)
        .single();

      const newXP = (profile?.xp_points || 0) + xpAmount;
      const newRank = getRankFromXP(newXP);

      await supabase
        .from('profiles')
        .update({
          xp_points: newXP,
          current_rank: newRank.name,
        })
        .eq('id', user.id);

      return {
        success: true,
        newXP,
        oldRank: profile?.current_rank || 'Scout',
        newRank: newRank.name,
        rankChanged: profile?.current_rank !== newRank.name,
        premiumGranted: false,
      };
    }

    const result = data?.[0];

    revalidatePath('/dashboard');

    return {
      success: true,
      newXP: result?.new_xp,
      oldRank: result?.old_rank,
      newRank: result?.new_rank,
      rankChanged: result?.rank_changed,
      premiumGranted: result?.premium_granted,
    };
  } catch (error) {
    console.error('Error in addUserXP:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get user's XP stats
 */
export async function getUserXPStats() {
  try {
    const supabase = await createClient(cookies());

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_points, current_rank, premium_expires_at')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    const xp = profile.xp_points || 0;
    const rank = getRankFromXP(xp);
    const progress = getProgressToNextRank(xp);
    const isPremium =
      profile.premium_expires_at &&
      new Date(profile.premium_expires_at) > new Date();

    return {
      xp,
      rank,
      progress,
      isPremium,
      premiumExpiresAt: profile.premium_expires_at,
    };
  } catch (error) {
    console.error('Error getting XP stats:', error);
    return null;
  }
}

/**
 * Get user's XP activity history
 */
export async function getXPHistory(limit = 10) {
  try {
    const supabase = await createClient(cookies());

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from('xp_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  } catch (error) {
    console.error('Error getting XP history:', error);
    return [];
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit = 10) {
  try {
    const supabase = await createClient(cookies());

    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, xp_points, current_rank')
      .gt('xp_points', 0)
      .order('xp_points', { ascending: false })
      .limit(limit);

    return (data || []).map((profile, index) => ({
      ...profile,
      position: index + 1,
      rank: getRankFromXP(profile.xp_points || 0),
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Check if user is premium (from gamification reward)
 */
export async function checkUserPremium(): Promise<boolean> {
  try {
    const supabase = await createClient(cookies());

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_expires_at')
      .eq('id', user.id)
      .single();

    if (!profile?.premium_expires_at) return false;

    return new Date(profile.premium_expires_at) > new Date();
  } catch {
    return false;
  }
}
