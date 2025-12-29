'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTenantBranding(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const brandName = formData.get('brandName') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const logo = formData.get('logo') as string;

    // Update tenant branding in database
    const { error } = await supabase
        .from('tenants')
        .update({
            brand_name: brandName,
            primary_color: primaryColor,
            logo_url: logo,
            updated_at: new Date().toISOString(),
        })
        .eq('owner_id', user.id);

    if (error) {
        console.error('Update tenant branding error:', error);
        return { error: 'Failed to update branding' };
    }

    revalidatePath('/tenant-admin/settings');
    return { success: true };
}

export async function getTenantSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    return data;
}
