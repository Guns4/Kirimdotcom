'use server';

import { createClient } from '@/utils/supabase/server';

export async function logClientError(error: {
  message: string;
  stack?: string;
  url: string;
  ua: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // @ts-ignore: Types not generated yet
  await supabase.from('system_health_logs').insert({
    error_message: error.message,
    stack_trace: error.stack,
    url: error.url,
    user_agent: error.ua,
    user_id: user?.id || null,
  });
}

export async function getRecentErrors() {
  const supabase = await createClient();

  // @ts-ignore: Types not generated yet
  const { data } = await supabase
    .from('system_health_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return data || [];
}
