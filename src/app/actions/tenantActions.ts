'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTenantBranding(formData: FormData) {
  const supabase = createClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const tenantId = formData.get('tenantId') as string;
  const colorPrimary = formData.get('colorPrimary') as string;
  const logoUrl = formData.get('logoUrl') as string;

  if (!tenantId) return { success: false, error: 'Tenant ID missing' };

  // 2. Validate Inputs
  if (colorPrimary && !/^#[0-9A-F]{6}$/i.test(colorPrimary)) {
    return { success: false, error: 'Invalid color format' };
  }

  // 3. Update DB
  const { error } = await supabase
    .from('tenants')
    .update({
      color_primary: colorPrimary,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenantId);

  if (error) {
    console.error('Update branding failed:', error);
    return { success: false, error: error.message };
  }

  // 4. Revalidate
  revalidatePath('/tenant-admin/settings');

  return { success: true };
}

export async function getTenantData(tenantId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).single();

  if (error) return null;
  return data;
}
