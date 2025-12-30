'use server';

import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function getCourierTrends() {
  noStore();
  const supabase = await createClient();

  // 1. Try to fetch today's stats
  const { data: todayStats, error } = await supabase
    .from('courier_stats_daily')
    .select('*')
    .eq('stat_date', new Date().toISOString().split('T')[0])
    .order('avg_duration_days', { ascending: true });

  if (error) {
    console.error('Error fetching trends:', error);
    return [];
  }

  // 2. If empty, it might be because the cron hasn't run.
  // In a real app, we might trigger calculation here or fallback to yesterday.
  // For this demo, if empty, we return empty list.
  return todayStats || [];
}

export async function triggerTrendCalculation() {
  const supabase = await createClient();

  // Call the RPC function we created
  const { error } = await supabase.rpc('calculate_daily_courier_stats');

  if (error) {
    console.error('Failed to calc trends:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
