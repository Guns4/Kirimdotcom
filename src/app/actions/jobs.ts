'use server';

import { createClient } from '@/utils/supabase/server';
import { safeAction } from '@/lib/safe-action';

export const getJobs = async () => {
  const supabase = await createClient();
  // Premium jobs first
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('is_premium', { ascending: false })
    .order('created_at', { ascending: false });
  return data || [];
};

export const postJob = async (data: any) => {
  return safeAction(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Mock payment check for premium would go here

    const { error } = await supabase.from('jobs').insert({
      user_id: user.id,
      ...data,
    });

    if (error) throw error;
    return { success: true };
  });
};
