// Daily Mission System Engine
// Mission tracking, completion detection, and auto-claim rewards

import { createClient } from '@/utils/supabase/client';

export interface MissionTemplate {
  id: string;
  mission_type: string;
  title: string;
  description: string;
  target_count: number;
  xp_reward: number;
  coin_reward: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface DailyMission {
  id: string;
  user_id: string;
  mission_template_id: string;
  current_progress: number;
  target_count: number;
  is_completed: boolean;
  is_claimed: boolean;
  xp_reward: number;
  coin_reward: number;
  mission_date: string;
  mission_templates?: MissionTemplate;
}

// Mission Event Types
export type MissionEventType =
  | 'LOGIN'
  | 'CEK_RESI'
  | 'TOPUP'
  | 'SHARE'
  | 'OPTIMIZE'
  | 'REFERRAL'
  | 'BULK_LABEL';

// Track a mission event and update progress
export async function trackMissionEvent(
  eventType: MissionEventType,
  eventData?: Record<string, any>
): Promise<{ success: boolean; completedMission?: DailyMission }> {
  const supabase: any = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false };

    // Log the event
    await supabase.from('mission_events').insert({
      user_id: user.id,
      event_type: eventType,
      event_data: eventData || {},
    });

    // Find matching incomplete mission for today
    const today = new Date().toISOString().split('T')[0];
    const { data: missions }: { data: DailyMission[] } = await supabase
      .from('daily_missions')
      .select('*, mission_templates(*)')
      .eq('user_id', user.id)
      .eq('mission_date', today)
      .eq('is_completed', false);

    if (!missions) return { success: true };

    // Find mission matching this event type
    const matchingMission = missions.find(
      (m) => m.mission_templates?.mission_type === eventType
    );

    if (!matchingMission) return { success: true };

    // Update progress
    const newProgress = matchingMission.current_progress + 1;
    const isCompleted = newProgress >= matchingMission.target_count;

    const { data: updatedMission, error } = await supabase
      .from('daily_missions')
      .update({
        current_progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', matchingMission.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      completedMission: isCompleted ? updatedMission : undefined,
    };
  } catch (error) {
    console.error('Mission tracking error:', error);
    return { success: false };
  }
}

// Auto-claim completed mission rewards
export async function claimMissionReward(missionId: string): Promise<{
  success: boolean;
  xpEarned?: number;
  coinsEarned?: number;
  error?: string;
}> {
  const supabase: any = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Get the mission
    const { data: mission, error: fetchError } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('id', missionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !mission) {
      return { success: false, error: 'Mission not found' };
    }

    if (!mission.is_completed) {
      return { success: false, error: 'Mission not completed' };
    }

    if (mission.is_claimed) {
      return { success: false, error: 'Already claimed' };
    }

    // Claim the reward
    const { error: updateError } = await supabase
      .from('daily_missions')
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', missionId);

    if (updateError) throw updateError;

    // TODO: Add XP to tycoon_profiles
    // TODO: Add coins to user balance

    return {
      success: true,
      xpEarned: mission.xp_reward,
      coinsEarned: mission.coin_reward,
    };
  } catch (error) {
    console.error('Claim reward error:', error);
    return { success: false, error: 'Failed to claim' };
  }
}

// Get today's missions for current user
export async function getTodayMissions(): Promise<DailyMission[]> {
  const supabase: any = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date().toISOString().split('T')[0];

    // First, generate missions if not exists (call stored function)
    await supabase.rpc('generate_daily_missions', { p_user_id: user.id });

    // Fetch today's missions
    const { data: missions, error } = await supabase
      .from('daily_missions')
      .select('*, mission_templates(*)')
      .eq('user_id', user.id)
      .eq('mission_date', today)
      .order('is_completed', { ascending: true });

    if (error) throw error;

    return missions || [];
  } catch (error) {
    console.error('Get missions error:', error);
    return [];
  }
}

// Get mission difficulty color
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'EASY':
      return 'text-green-600 bg-green-100';
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100';
    case 'HARD':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Get mission type icon
export function getMissionIcon(missionType: string): string {
  switch (missionType) {
    case 'LOGIN':
      return '🔑';
    case 'CEK_RESI':
      return '📦';
    case 'TOPUP':
      return '💰';
    case 'SHARE':
      return '📤';
    case 'OPTIMIZE':
      return '🎯';
    case 'REFERRAL':
      return '👥';
    case 'BULK_LABEL':
      return '🏷️';
    default:
      return '⭐';
  }
}
