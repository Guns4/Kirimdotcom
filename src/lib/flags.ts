import { createClient } from '@/utils/supabase/client';

export interface FeatureFlag {
  key: string;
  is_enabled: boolean;
}

export async function fetchFeatureFlags(): Promise<Record<string, boolean>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('feature_flags')
    .select('key, is_enabled');

  if (error) {
    console.error('Error fetching flags:', error);
    return {};
  }

  // Convert array to Record<key, boolean> for O(1) lookup
  const flags: Record<string, boolean> = {};
  data?.forEach((f) => {
    flags[f.key] = f.is_enabled ?? false;
  });

  return flags;
}
