import { createClient } from '@/utils/supabase/server';
import { TycoonEngine } from './tycoon-engine';

export interface Mission {
  id: string; // user_mission_id
  config_id: number;
  title: string;
  description: string;
  progress: number;
  target_count: number;
  is_claimed: boolean;
  xp_reward: number;
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED';
}

export const MissionEngine = {
  async getDailyMissions(userId: string) {
    // Fix: Double await for createClient stability
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;
    const today = new Date().toISOString().split('T')[0];

    // 1. Check existing missions for today
    const { data: existing } = await (supabase as any)
      .from('user_daily_missions')
      .select(`
                *,
                config:daily_missions_config(*)
            `)
      .eq('user_id', userId)
      .eq('date', today);

    if (existing && existing.length > 0) {
      return existing.map((m: any) => ({
        id: m.id,
        config_id: m.config_id,
        title: m.config.title,
        description: m.config.description,
        progress: m.progress,
        target_count: m.config.target_count,
        is_claimed: m.is_claimed,
        xp_reward: m.config.xp_reward,
        status: m.is_claimed ? 'CLAIMED' : (m.progress >= m.config.target_count ? 'COMPLETED' : 'IN_PROGRESS')
      }));
    }

    // 2. Generate new missions calls if none exist
    // Note: In a real app, this should be done via a Postgres Trigger or Scheduled Function to avoid race conditions.
    // For this demo, we'll auto-generate on read.
    await this.generateMissions(userId, today, supabase);

    // Recursive call to get the newly created missions
    return this.getDailyMissions(userId);
  },

  async generateMissions(userId: string, date: string, supabase: any) {
    // Fetch configs
    const { data: configs } = await (supabase as any)
      .from('daily_missions_config')
      .select('*')
      .eq('is_active', true);

    if (!configs) return;

    // Simple Random Selection: 1 Easy, 2 Medium, 1 Hard
    const easy = configs.filter((c: any) => c.difficulty === 'EASY');
    const medium = configs.filter((c: any) => c.difficulty === 'MEDIUM');
    const hard = configs.filter((c: any) => c.difficulty === 'HARD');

    const selected = [
      ...this.sample(easy, 1),
      ...this.sample(medium, 2),
      ...this.sample(hard, 1)
    ];

    const inserts = selected.map(config => ({
      user_id: userId,
      config_id: config.id,
      date: date,
      progress: 0,
      is_claimed: false
    }));

    // Use Login mission if available and track it immediately if needed, but let client handle tracking
    await (supabase as any).from('user_daily_missions').insert(inserts);
  },

  sample(array: any[], count: number) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  async trackMissionEvent(userId: string, eventType: string, increment: number = 1) {
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;
    const today = new Date().toISOString().split('T')[0];

    // Find relevant missions
    // Join with config to filter by task_type
    // Supabase select with join filtering is tricky, so we fetch and filter or use rpc.
    // Simplified: Fetch all today's missions for user, then filter in code.

    const { data: missions } = await (supabase as any)
      .from('user_daily_missions')
      .select(`*, config:daily_missions_config(task_type, target_count)`)
      .eq('user_id', userId)
      .eq('date', today)
      .eq('is_claimed', false); // Don't track if already claimed

    if (!missions) return;

    for (const mission of missions) {
      if (mission.config.task_type === eventType) {
        const newProgress = Math.min(mission.progress + increment, mission.config.target_count);
        if (newProgress !== mission.progress) {
          await (supabase as any)
            .from('user_daily_missions')
            .update({ progress: newProgress })
            .eq('id', mission.id);
        }
      }
    }
  },

  async claimMission(missionId: string, userId: string) {
    const supabasePromise = await createClient();
    const supabase = await supabasePromise;

    // Verify Completion
    const { data: mission } = await (supabase as any)
      .from('user_daily_missions')
      .select(`*, config:daily_missions_config(xp_reward, target_count)`)
      .eq('id', missionId)
      .eq('user_id', userId)
      .single();

    if (!mission) throw new Error('Mission not found');
    if (mission.is_claimed) throw new Error('Already claimed');
    if (mission.progress < mission.config.target_count) throw new Error('Mission not completed');

    // Claim
    const { error } = await (supabase as any)
      .from('user_daily_missions')
      .update({ is_claimed: true })
      .eq('id', missionId);

    if (error) throw error;

    // Award XP
    await TycoonEngine.awardXP(userId, mission.config.xp_reward, `MISSION_${mission.id}`);

    return { success: true, xp: mission.config.xp_reward };
  }
};
