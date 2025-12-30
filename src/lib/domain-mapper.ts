import { createClient } from '@supabase/supabase-js';

// Note: Ensure your environment variables are available to Edge Functions.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getTenantSlugFromDomain(domain: string): Promise<string | null> {
    // 1. Remove port if local (e.g. localhost:3000 -> localhost)
    const hostname = domain.split(':')[0];

    // 2. Define your main domains to ignore
    const mainDomains = ['cekkirim.com', 'www.cekkirim.com', 'localhost', 'cekkirim.vercel.app'];
    if (mainDomains.includes(hostname)) return null;

    // 3. Check Subdomain (e.g. demo.cekkirim.com -> slug: demo)
    if (hostname.endsWith('.cekkirim.com')) {
        return hostname.replace('.cekkirim.com', '');
    }

    // 4. Check Custom Domain in DB (e.g. portal.logistic-corp.com)
    // Note: In detailed production, cache this response (e.g. Vercel KV or Edge Config) for speed.
    const { data } = await supabase
        .from('tenants')
        .select('slug')
        .eq('domain', hostname)
        .single();
    
    return data?.slug || null;
}
