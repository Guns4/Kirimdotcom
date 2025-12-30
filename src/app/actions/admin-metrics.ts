'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Types
export interface BusinessMetrics {
  revenue: {
    ads: number;
    affiliate: number;
    total: number;
  };
  retention: {
    returningUsers: number; // Percentage
    activeUsers7Days: number;
  };
  supabase: {
    reads: number;
    writes: number;
    storage: number; // Bytes
    prediction: 'safe' | 'warning' | 'critical';
  };
}

export async function getBusinessMetrics(): Promise<BusinessMetrics> {
  const supabase = await createClient();

  // 1. Get Usage Data (Mocked/Estimated from Search History)
  // In real app, we would query 'search_history' count
  const { count: totalSearches } = await supabase
    .from('search_history')
    .select('*', { count: 'exact', head: true });

  const searches = totalSearches || 0;

  // 2. Revenue Estimates (Assumptions)
  // Ads: 2% CTR, CPC Rp 500
  // Affiliate: 1% Conversion, Comission Rp 2000
  const adRevenue = searches * 0.02 * 500;
  const affRevenue = searches * 0.01 * 2000;

  // 3. Supabase Usage Estimate
  // Reads: Searches * 5 (Approx DB reads per search)
  // Writes: Searches * 1 (History insert)
  const reads = searches * 5;
  const writes = searches;

  // Free Tier Limits (Approx)
  // Monthly Reads: ? (Supabase charges by compute/disk usually, but let's assume hypothetical limits)
  // Let's use generic "Activity" score
  const usageScore = reads + writes;
  let prediction: 'safe' | 'warning' | 'critical' = 'safe';
  if (usageScore > 50000) prediction = 'warning';
  if (usageScore > 100000) prediction = 'critical';

  return {
    revenue: {
      ads: Math.round(adRevenue),
      affiliate: Math.round(affRevenue),
      total: Math.round(adRevenue + affRevenue),
    },
    retention: {
      returningUsers: 15, // Mocked: Implementation would require complex distinct queries
      activeUsers7Days: 120, // Mocked
    },
    supabase: {
      reads,
      writes,
      storage: 0,
      prediction,
    },
  };
}

export async function getSystemStatus() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('system_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single();

  return data?.value === 'true';
}

export async function toggleMaintenanceMode(currentState: boolean) {
  'use server';
  const supabase = await createClient();

  // Auth check should be here

  await (supabase as any).from('system_settings').upsert({
    key: 'maintenance_mode',
    value: (!currentState).toString(),
  });
}
