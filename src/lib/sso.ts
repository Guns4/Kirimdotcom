import { createClient } from '@/utils/supabase/client';

export interface SSOConfig {
    id: string;
    organization_name: string;
    domain: string;
    sso_provider: string;
    provider_id: string | null;
    redirect_url: string;
    logo_url: string | null;
    primary_color: string;
    is_active: boolean;
}

/**
 * Check if an email belongs to an enterprise domain with SSO configured
 */
export async function checkEnterpriseDomain(email: string): Promise<SSOConfig | null> {
    const domain = email.split('@')[1];
    if (!domain) return null;

    const supabase = createClient();

    const { data, error } = await (supabase as any)
        .from('enterprise_sso_config')
        .select('*')
        .eq('domain', domain)
        .eq('is_active', true)
        .single();

    if (error || !data) return null;
    return data as SSOConfig;
}

/**
 * Initiate SSO login flow with the configured provider
 */
export async function signInWithEnterpriseSSO(email: string, config: SSOConfig) {
    const supabase = createClient();

    // Determine redirect URL
    const redirectTo = `${window.location.origin}${config.redirect_url || '/dashboard'}`;

    // Use Supabase SSO
    const { data, error } = await supabase.auth.signInWithSSO({
        domain: config.domain,
        options: {
            redirectTo,
        }
    });

    return { data, error };
}

/**
 * Get all configured SSO providers (for admin)
 */
export async function getAllSSOConfigs(): Promise<SSOConfig[]> {
    const supabase = createClient();

    const { data, error } = await (supabase as any)
        .from('enterprise_sso_config')
        .select('*')
        .order('organization_name');

    if (error) return [];
    return data as SSOConfig[];
}

/**
 * Check if current user belongs to an enterprise organization
 */
export async function getUserOrganization(userId: string) {
    const supabase = createClient();

    const { data, error } = await (supabase as any)
        .from('user_roles')
        .select(`
            role,
            organization:enterprise_sso_config(
                id,
                organization_name,
                logo_url,
                primary_color
            )
        `)
        .eq('user_id', userId)
        .single();

    if (error) return null;
    return data;
}
