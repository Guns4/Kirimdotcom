'use server';

import { createClient } from '@/utils/supabase/server';

interface PointsResult {
  success: boolean;
  message: string;
  pointsAwarded?: number;
  newBalance?: number;
  error?: string;
}

/**
 * Award points for daily login
 */
export async function awardDailyLoginPoints(): Promise<PointsResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: 'Not authenticated',
        error: 'UNAUTHORIZED',
      };
    }

    // Check if already claimed today
    const { data: canEarn } = await supabase.rpc('can_earn_daily_points', {
      p_user_id: user.id,
      p_action_type: 'daily_login',
      p_max_count: 1, // Once per day
    });

    if (!canEarn) {
      return {
        success: false,
        message: 'Daily login points already claimed today',
        error: 'ALREADY_CLAIMED',
      };
    }

    // Award points
    const { data: result } = await supabase.rpc('award_points', {
      p_user_id: user.id,
      p_points: 10,
      p_action_type: 'daily_login',
      p_description: 'Daily login reward',
    });

    if (result?.success) {
      // Record action
      await supabase.rpc('record_daily_action', {
        p_user_id: user.id,
        p_action_type: 'daily_login',
      });

      return {
        success: true,
        message: '+10 points! Daily login bonus',
        pointsAwarded: 10,
        newBalance: result.new_balance,
      };
    }

    return {
      success: false,
      message: 'Failed to award points',
      error: 'AWARD_FAILED',
    };
  } catch (error) {
    console.error('Error awarding daily login points:', error);
    return {
      success: false,
      message: 'System error',
      error: 'SYSTEM_ERROR',
    };
  }
}

/**
 * Award points for tracking resi
 */
export async function awardTrackingPoints(
  resiNumber: string
): Promise<PointsResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: 'Not authenticated',
        error: 'UNAUTHORIZED',
      };
    }

    // Check daily limit (max 5 per day)
    const { data: canEarn } = await supabase.rpc('can_earn_daily_points', {
      p_user_id: user.id,
      p_action_type: 'check_resi',
      p_max_count: 5,
    });

    if (!canEarn) {
      return {
        success: false,
        message: 'Daily tracking limit reached (5/day)',
        error: 'LIMIT_REACHED',
      };
    }

    // Award points
    const { data: result } = await supabase.rpc('award_points', {
      p_user_id: user.id,
      p_points: 5,
      p_action_type: 'check_resi',
      p_description: 'Tracking resi reward',
      p_metadata: JSON.stringify({ resi_number: resiNumber }),
    });

    if (result?.success) {
      // Record action
      await supabase.rpc('record_daily_action', {
        p_user_id: user.id,
        p_action_type: 'check_resi',
      });

      return {
        success: true,
        message: '+5 points! Keep tracking',
        pointsAwarded: 5,
        newBalance: result.new_balance,
      };
    }

    return {
      success: false,
      message: 'Failed to award points',
      error: 'AWARD_FAILED',
    };
  } catch (error) {
    console.error('Error awarding tracking points:', error);
    return {
      success: false,
      message: 'System error',
      error: 'SYSTEM_ERROR',
    };
  }
}

/**
 * Award points for social sharing
 */
export async function awardSocialSharePoints(
  platform: string
): Promise<PointsResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: 'Not authenticated',
        error: 'UNAUTHORIZED',
      };
    }

    // Check daily limit (max 3 shares per day)
    const { data: canEarn } = await supabase.rpc('can_earn_daily_points', {
      p_user_id: user.id,
      p_action_type: 'share_social',
      p_max_count: 3,
    });

    if (!canEarn) {
      return {
        success: false,
        message: 'Daily share limit reached (3/day)',
        error: 'LIMIT_REACHED',
      };
    }

    // Award points
    const { data: result } = await supabase.rpc('award_points', {
      p_user_id: user.id,
      p_points: 50,
      p_action_type: 'share_social',
      p_description: `Shared to ${platform}`,
      p_metadata: JSON.stringify({ platform }),
    });

    if (result?.success) {
      // Record action
      await supabase.rpc('record_daily_action', {
        p_user_id: user.id,
        p_action_type: 'share_social',
      });

      return {
        success: true,
        message: '+50 points! Thanks for sharing!',
        pointsAwarded: 50,
        newBalance: result.new_balance,
      };
    }

    return {
      success: false,
      message: 'Failed to award points',
      error: 'AWARD_FAILED',
    };
  } catch (error) {
    console.error('Error awarding share points:', error);
    return {
      success: false,
      message: 'System error',
      error: 'SYSTEM_ERROR',
    };
  }
}

/**
 * Get user points balance
 */
export async function getUserPoints() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { points: 0, error: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('points_balance')
      .eq('id', user.id)
      .single();

    return { points: profile?.points_balance || 0, error: null };
  } catch (error) {
    console.error('Error fetching points:', error);
    return { points: 0, error: 'Failed to fetch points' };
  }
}

/**
 * Get point history
 */
export async function getPointHistory(limit: number = 20) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('point_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching point history:', error);
    return { data: null, error: 'Failed to fetch history' };
  }
}
