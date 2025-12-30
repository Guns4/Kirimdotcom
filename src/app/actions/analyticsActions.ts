'use server';

import { createClient } from '@/utils/supabase/server';

export async function logEvent(
  name: string,
  properties: Record<string, any> = {}
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Basic session/cookie tracking could be added here

  await (supabase.from('analytics_events') as any).insert({
    name,
    properties,
    user_id: user?.id || null,
  });
}

export async function getTopCouriers() {
  const supabase = await createClient();

  // Aggregate tracking events named 'click_cek_resi'
  // Note: Supabase basic client doesn't support complex aggregation easily without RPC
  // So we fetch rows and aggregate in memory for MVP (Not performant for millions of rows)
  // Ideally: Use a Database View or RPC function

  const { data } = await supabase
    .from('analytics_events')
    .select('properties')
    .eq('name', 'click_cek_resi')
    .limit(1000); // Limit for performance MVP

  const courierCounts: Record<string, number> = {};

  data?.forEach((event: any) => {
    // Assuming properties contains 'courier' or we infer from somewhere
    // For 'click_cek_resi', we might have 'waybill' but not courier if auto-detect
    // Let's assume user sends 'courier' if known, or we just count clicks per source

    // If we only have waybill, we can't easily know courier without detection logic here.
    // Let's assume the event tracking sends a 'courier' property if user selected one,
    // or we just default to 'Unknown'
    const courier = event.properties?.courier || 'Unknown';
    courierCounts[courier] = (courierCounts[courier] || 0) + 1;
  });

  const topCouriers = Object.entries(courierCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return topCouriers;
}
