'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Get stuck packages for current user
 */
export async function getStuckPackages() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.rpc('get_stuck_packages', {
      p_user_id: user.id,
    });

    return { data, error };
  } catch (error) {
    console.error('Error fetching stuck packages:', error);
    return { data: null, error: 'Failed to fetch stuck packages' };
  }
}

/**
 * Get complaint template for courier
 */
export async function getComplaintTemplate(
  courier: string,
  awb: string,
  customerName: string,
  destination: string,
  daysStuck: number,
  lastStatus: string
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const senderName = user?.user_metadata?.full_name || 'Seller';

    const { data, error } = await supabase.rpc('get_complaint_template', {
      p_courier: courier,
      p_awb: awb,
      p_customer_name: customerName,
      p_destination: destination,
      p_days: daysStuck,
      p_last_status: lastStatus,
      p_sender_name: senderName,
    });

    if (error || !data || data.length === 0) {
      return { data: null, error: 'Template not found' };
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error fetching complaint template:', error);
    return { data: null, error: 'Failed to fetch template' };
  }
}

/**
 * Mark package as resolved
 */
export async function resolveStuckPackage(packageId: string, note?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update package
    const { error: packageError } = await supabase
      .from('tracked_packages')
      .update({
        is_stuck: false,
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_note: note,
      })
      .eq('id', packageId)
      .eq('user_id', user.id);

    if (packageError) {
      return { success: false, error: 'Failed to resolve package' };
    }

    // Update alert
    await supabase
      .from('stuck_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('package_id', packageId);

    return { success: true, message: 'Package marked as resolved' };
  } catch (error) {
    console.error('Error resolving package:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Mark complaint as sent
 */
export async function markComplaintSent(packageId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    await supabase
      .from('stuck_alerts')
      .update({ complaint_sent: true })
      .eq('package_id', packageId);

    return { success: true, message: 'Complaint marked as sent' };
  } catch (error) {
    console.error('Error marking complaint:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Add package to tracking monitor
 */
export async function addPackageToMonitor(
  awb: string,
  courier: string,
  customerName?: string,
  customerPhone?: string,
  destination?: string
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase.from('tracked_packages').upsert({
      user_id: user.id,
      awb_number: awb,
      courier: courier.toLowerCase(),
      customer_name: customerName,
      customer_phone: customerPhone,
      destination,
      last_status_update: new Date().toISOString(),
      current_status: 'pending',
    });

    if (error) {
      console.error('Error adding package:', error);
      return { success: false, error: 'Failed to add package' };
    }

    return { success: true, message: 'Package added to monitoring' };
  } catch (error) {
    console.error('Error in addPackageToMonitor:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Get stuck packages count (for dashboard badge)
 */
export async function getStuckPackagesCount() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { count: 0, error: null };
    }

    const { count, error } = await supabase
      .from('tracked_packages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_stuck', true)
      .eq('is_resolved', false);

    return { count: count || 0, error };
  } catch (error) {
    console.error('Error fetching count:', error);
    return { count: 0, error: 'Failed to fetch count' };
  }
}

/**
 * Run stuck detection (for cron/admin)
 */
export async function runStuckDetection() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('detect_stuck_packages');

    if (error) {
      console.error('Error running detection:', error);
      return { success: false, error: 'Detection failed' };
    }

    return {
      success: true,
      message: `Detected ${data} stuck packages`,
      count: data,
    };
  } catch (error) {
    console.error('Error in runStuckDetection:', error);
    return { success: false, error: 'System error' };
  }
}
