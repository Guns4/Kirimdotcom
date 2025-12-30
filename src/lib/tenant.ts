// Tenant Service
// Resolve branding based on user or domain

export interface TenantConfig {
    id: string;
    userId: string;
    brandName: string;
    logoUrl?: string;
    primaryColor: string;
    hideFooter: boolean;
}

const DEFAULT_BRAND: TenantConfig = {
    id: 'default',
    userId: 'system',
    brandName: 'CekKirim',
    logoUrl: undefined,
    primaryColor: '#3B82F6',
    hideFooter: false
};

// Get tenant by current user (for dashboard)
export async function getCurrentTenant(): Promise<TenantConfig> {
    // In production: 
    // const { data } = await supabase.from('saas_tenants').select('*').eq('user_id', auth.uid()).single();

    // Mock Logic
    // If user is "VIP", return custom branding
    // For now, return default
    return DEFAULT_BRAND;
}

// Mock function to simulate a tenant context for development
export function getMockTenant(type: 'DEFAULT' | 'CUSTOM' = 'DEFAULT'): TenantConfig {
    if (type === 'CUSTOM') {
        return {
            id: 'tenant-123',
            userId: 'user-vip',
            brandName: 'JNE Agen 007',
            logoUrl: 'https://placehold.co/100x100/orange/white?text=JNE',
            primaryColor: '#F26522',
            hideFooter: true
        };
    }
    return DEFAULT_BRAND;
}
