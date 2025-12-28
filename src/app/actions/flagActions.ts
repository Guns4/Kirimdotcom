'use server'

import { createClient } from '@/utils/supabase/server';
import { unstable_cache } from 'next/cache';

export const getPublicFlags = unstable_cache(
    async () => {
        const supabase = await createClient();
        // Only fetch enabled/disabled state for public usage
        // @ts-ignore: Types not generated yet
        const { data } = await supabase.from('feature_flags').select('key, is_enabled');
        if (!data) return {};

        // Convert array to map: { 'payment': true, 'chat': false }
        const flagMap: Record<string, boolean> = {};
        data.forEach((f: any) => {
            flagMap[f.key] = f.is_enabled;
        });
        return flagMap;
    },
    ['public_feature_flags'],
    { revalidate: 60, tags: ['feature_flags'] }
);
