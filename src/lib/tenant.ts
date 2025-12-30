import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import { cookies } from 'next/headers';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    color_primary: string;
    logo_url: string;
}

// Cached fetcher for high performance
export const getTenantByHostname = cache(async (hostname: string): Promise<Tenant | null> => {
    const supabase = createClient(cookies());

    // 1. Try match by Custom Domain
    const cleanHostname = hostname.split(':')[0]; // Remove port if present

    let { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('domain', cleanHostname)
        .single();

    // 2. Fallback: Check subdomain if using main domain (e.g. slug.cekkirim.com)
    if (!data && cleanHostname.includes('.cekkirim.com')) {
        const slug = cleanHostname.split('.')[0];
        const res = await supabase.from('tenants').select('*').eq('slug', slug).single();
        data = res.data;
    }

    return data;
});
