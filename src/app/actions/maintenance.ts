'use server';

import { setMaintenanceMode, getMaintenanceInfo } from '@/lib/systemHealth';
import { createServerClient } from '@/utils/supabase/server';

/**
 * Admin Actions for System Health
 */

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(
  enabled: boolean,
  message?: string,
  estimatedEnd?: string
) {
  // Check if user is admin
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_role')
    .eq('id', user.id)
    .single();

  if (profile?.user_role !== 'admin') {
    return { success: false, error: 'Not authorized' };
  }

  // Update maintenance settings
  const settings = [
    { key: 'site_maintenance_mode', value: enabled ? 'true' : 'false' },
  ];

  if (message) {
    settings.push({ key: 'maintenance_message', value: message });
  }

  if (estimatedEnd) {
    settings.push({ key: 'maintenance_end', value: estimatedEnd });
  }

  for (const setting of settings) {
    await supabase.from('site_settings').upsert({
      key: setting.key,
      value: setting.value,
      updated_at: new Date().toISOString(),
    });
  }

  return {
    success: true,
    enabled,
    message: enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
  };
}

/**
 * Get current maintenance status
 */
export async function getMaintenanceStatus() {
  return await getMaintenanceInfo();
}

/**
 * Clear error logs older than X days
 */
export async function clearOldErrorLogs(daysOld = 30) {
  const supabase = await createServerClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { error, count } = await supabase
    .from('error_logs')
    .delete()
    .lt('created_at', cutoffDate.toISOString());

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, deleted: count };
}
