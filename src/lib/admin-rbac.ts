import { createClient } from '@/utils/supabase/server';

export type AdminRole = 'SUPER_ADMIN' | 'FINANCE' | 'SUPPORT' | 'CONTENT' | 'LOGISTICS';

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
    SUPER_ADMIN: ['*'],
    FINANCE: ['menu_finance', 'menu_withdraw', 'view_revenue'],
    SUPPORT: ['menu_tickets', 'menu_users', 'view_activity'],
    CONTENT: ['menu_blog', 'menu_ads', 'edit_content'],
    LOGISTICS: ['menu_orders', 'menu_supply', 'manage_inventory'],
};

export async function getCurrentAdminRole(): Promise<AdminRole | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from('admin_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return data?.role || null; // Default to null if not found
}

export function canAccess(role: AdminRole, resource: string): boolean {
    if (role === 'SUPER_ADMIN') return true;
    return ROLE_PERMISSIONS[role]?.includes(resource) || false;
}
