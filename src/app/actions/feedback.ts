'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type FeedbackType = 'bug' | 'feature' | 'nps' | 'general' | 'other';

export async function submitFeedback(
  type: FeedbackType,
  message: string,
  rating?: number, // 0-10 for NPS
  path?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Validate NPS
  if (type === 'nps') {
    if (typeof rating === 'undefined' || rating < 0 || rating > 10) {
      return { error: 'Invalid NPS rating' };
    }
  }

  // 2. Insert into DB (Assuming 'feedback' table exists)
  // Structure: id, user_id, type, message, rating, path, created_at
  const { error } = await (supabase.from('feedback') as any).insert({
    user_id: user?.id || null, // Allow anonymous if needed, or enforce auth
    type,
    message,
    rating,
    path: path || '/',
    metadata: {
      ua: 'server-action', // You could grab real UA from headers if needed
    },
  });

  if (error) {
    console.error('Submit feedback error:', error);
    return { error: 'Failed to submit feedback' };
  }

  return { success: true };
}

export async function getNPSStats() {
  const supabase = await createClient();

  // Calculate NPS: % Promoters (9-10) - % Detractors (0-6)
  // Passives (7-8) are ignored in calculation but counted in total

  const { data, error } = await (supabase.from('feedback') as any)
    .select('rating')
    .eq('type', 'nps');

  if (error || !data || data.length === 0) {
    return {
      score: 0,
      total: 0,
      breakdown: { promoters: 0, passives: 0, detractors: 0 },
    };
  }

  let promoters = 0;
  let detractors = 0;
  let passives = 0;

  (data as any[]).forEach((f: any) => {
    const r = f.rating;
    if (r >= 9) promoters++;
    else if (r >= 7) passives++;
    else detractors++;
  });

  const total = data.length;
  const score = Math.round(((promoters - detractors) / total) * 100);

  return {
    score,
    total,
    breakdown: {
      promoters,
      passives,
      detractors,
    },
  };
}

export async function getRecentFeedback(limit = 10) {
  const supabase = await createClient();

  const { data } = await (supabase.from('feedback') as any)
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}
