'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Register as local courier
 */
export async function registerAsCourier(data: {
  courierName: string;
  phone: string;
  whatsapp?: string;
  province: string;
  city: string;
  kecamatan: string;
  kelurahan?: string;
  fullAddress?: string;
  coverageAreas?: string[];
  flatRate: number;
  vehicleType?: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check existing
    const { data: existing } = await supabase
      .from('local_couriers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return { success: false, error: 'Already registered as courier' };
    }

    const { error } = await supabase.from('local_couriers').insert({
      user_id: user.id,
      courier_name: data.courierName,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      province: data.province,
      city: data.city,
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      full_address: data.fullAddress,
      coverage_areas: data.coverageAreas || [data.kecamatan.toLowerCase()],
      flat_rate: data.flatRate,
      vehicle_type: data.vehicleType || 'motor',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/kurir-lokal');
    return { success: true, message: 'Registered as local courier!' };
  } catch (error) {
    console.error('Error registering:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Toggle online status
 */
export async function toggleCourierOnline(isOnline: boolean) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    await supabase.rpc('toggle_courier_online', {
      p_user_id: user.id,
      p_is_online: isOnline,
    });

    revalidatePath('/dashboard/courier');
    return { success: true, isOnline };
  } catch (error) {
    console.error('Error toggling status:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Find couriers in kecamatan
 */
export async function findLocalCouriers(kecamatan: string, city?: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('find_local_couriers', {
      p_kecamatan: kecamatan,
      p_city: city || null,
    });

    return { data, error };
  } catch (error) {
    console.error('Error finding couriers:', error);
    return { data: null, error: 'Failed to find couriers' };
  }
}

/**
 * Get my courier profile
 */
export async function getMyCourierProfile() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('local_couriers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error: 'System error' };
  }
}

/**
 * Update courier profile
 */
export async function updateCourierProfile(updates: {
  courierName?: string;
  phone?: string;
  whatsapp?: string;
  flatRate?: number;
  coverageAreas?: string[];
  vehicleType?: string;
  operatingStart?: string;
  operatingEnd?: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (updates.courierName) updateData.courier_name = updates.courierName;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.whatsapp) updateData.whatsapp = updates.whatsapp;
    if (updates.flatRate) updateData.flat_rate = updates.flatRate;
    if (updates.coverageAreas)
      updateData.coverage_areas = updates.coverageAreas;
    if (updates.vehicleType) updateData.vehicle_type = updates.vehicleType;
    if (updates.operatingStart)
      updateData.operating_start = updates.operatingStart;
    if (updates.operatingEnd) updateData.operating_end = updates.operatingEnd;

    const { error } = await supabase
      .from('local_couriers')
      .update(updateData)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Profile updated' };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Create local delivery order
 */
export async function createLocalDeliveryOrder(order: {
  courierId: string;
  pickup: {
    name: string;
    phone: string;
    address: string;
    kecamatan: string;
    notes?: string;
  };
  delivery: {
    name: string;
    phone: string;
    address: string;
    kecamatan: string;
    notes?: string;
  };
  packageDescription?: string;
  packageWeight?: string;
  isFragile?: boolean;
  deliveryFee: number;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const orderCode = 'LCL-' + Date.now().toString(36).toUpperCase();

    const { data, error } = await supabase
      .from('local_delivery_orders')
      .insert({
        customer_id: user.id,
        courier_id: order.courierId,
        order_code: orderCode,
        pickup_name: order.pickup.name,
        pickup_phone: order.pickup.phone,
        pickup_address: order.pickup.address,
        pickup_kecamatan: order.pickup.kecamatan,
        pickup_notes: order.pickup.notes,
        delivery_name: order.delivery.name,
        delivery_phone: order.delivery.phone,
        delivery_address: order.delivery.address,
        delivery_kecamatan: order.delivery.kecamatan,
        delivery_notes: order.delivery.notes,
        package_description: order.packageDescription,
        package_weight: order.packageWeight || 'sedang',
        is_fragile: order.isFragile || false,
        delivery_fee: order.deliveryFee,
        total_amount: order.deliveryFee,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data, orderCode };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Get courier WhatsApp link
 */
export function getCourierWhatsAppLink(
  whatsapp: string,
  kecamatan: string
): string {
  let phone = whatsapp.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }

  const message = `Halo Kak, saya perlu jasa antar barang di ${kecamatan}. Apakah tersedia sekarang? 📦`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Get courier's pending orders
 */
export async function getCourierOrders(status?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Get courier
    const { data: courier } = await supabase
      .from('local_couriers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!courier) {
      return { data: null, error: 'Not a courier' };
    }

    let query = supabase
      .from('local_delivery_orders')
      .select('*')
      .eq('courier_id', courier.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.limit(50);

    return { data, error };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { data: null, error: 'System error' };
  }
}
