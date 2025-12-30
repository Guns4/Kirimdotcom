'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface OrderDetails {
  courierId: string;
  courierName: string;
  courierWhatsapp: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageDescription?: string;
  flatRate: number;
}

/**
 * Generate WhatsApp order message
 */
export async function generateOrderWhatsAppLink(
  order: OrderDetails
): Promise<string> {
  try {
    const supabase = await createClient();

    // Get message from DB or use default
    const { data: template } = await supabase.rpc('generate_order_wa_message', {
      p_courier_id: order.courierId,
      p_pickup_address: order.pickupAddress,
      p_delivery_address: order.deliveryAddress,
      p_package_desc: order.packageDescription || 'Paket',
    });

    let message = template;

    if (!message) {
      // Fallback message
      message = `Halo ${order.courierName}! 👋

Saya mau kirim paket via CekKirim:

📦 *DETAIL PENGIRIMAN*
━━━━━━━━━━━━━━━━━━━━
📍 Jemput: ${order.pickupAddress}
📍 Antar: ${order.deliveryAddress}
📦 Barang: ${order.packageDescription || 'Paket'}
💰 Tarif: Rp ${order.flatRate.toLocaleString('id-ID')}

Bisa dijemput sekarang? 🙏`;
    }

    // Clean phone number
    let phone = order.courierWhatsapp.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  } catch (error) {
    console.error('Error generating WA link:', error);
    // Return basic link
    let phone = order.courierWhatsapp.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }
    return `https://wa.me/${phone}`;
  }
}

/**
 * Create order and get WA link
 */
export async function createOrderAndGetWALink(orderData: {
  courierId: string;
  pickup: {
    name: string;
    phone: string;
    address: string;
    kecamatan: string;
  };
  delivery: {
    name: string;
    phone: string;
    address: string;
    kecamatan: string;
  };
  packageDescription?: string;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get courier
    const { data: courier } = await supabase
      .from('local_couriers')
      .select('*')
      .eq('id', orderData.courierId)
      .single();

    if (!courier) {
      return { success: false, error: 'Courier not found' };
    }

    // Create order
    const orderCode = 'LCL-' + Date.now().toString(36).toUpperCase();

    const { data: order, error } = await supabase
      .from('local_delivery_orders')
      .insert({
        customer_id: user.id,
        courier_id: orderData.courierId,
        order_code: orderCode,
        pickup_name: orderData.pickup.name,
        pickup_phone: orderData.pickup.phone,
        pickup_address: orderData.pickup.address,
        pickup_kecamatan: orderData.pickup.kecamatan,
        delivery_name: orderData.delivery.name,
        delivery_phone: orderData.delivery.phone,
        delivery_address: orderData.delivery.address,
        delivery_kecamatan: orderData.delivery.kecamatan,
        package_description: orderData.packageDescription,
        delivery_fee: courier.flat_rate,
        total_amount: courier.flat_rate,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Generate WA link
    const waLink = await generateOrderWhatsAppLink({
      courierId: courier.id,
      courierName: courier.courier_name,
      courierWhatsapp: courier.whatsapp || courier.phone,
      pickupAddress: orderData.pickup.address,
      deliveryAddress: orderData.delivery.address,
      packageDescription: orderData.packageDescription,
      flatRate: courier.flat_rate,
    });

    return {
      success: true,
      orderCode,
      orderId: order.id,
      waLink,
      courierName: courier.courier_name,
      flatRate: courier.flat_rate,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Submit review for courier
 */
export async function submitCourierReview(
  orderId: string,
  rating: number,
  reviewText?: string,
  aspects?: {
    punctuality?: number;
    friendliness?: number;
    care?: number;
  }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.rpc('submit_courier_review', {
      p_order_id: orderId,
      p_reviewer_id: user.id,
      p_rating: rating,
      p_review_text: reviewText || null,
      p_punctuality: aspects?.punctuality || null,
      p_friendliness: aspects?.friendliness || null,
      p_care: aspects?.care || null,
    });

    if (error || !data || data.length === 0) {
      return { success: false, error: 'Failed to submit review' };
    }

    const result = data[0];

    if (!result.success) {
      return { success: false, error: result.message };
    }

    revalidatePath('/kurir-lokal');
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Get courier reviews
 */
export async function getCourierReviews(courierId: string, limit: number = 20) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('courier_reviews')
      .select('*')
      .eq('courier_id', courierId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { data: null, error: 'Failed to fetch reviews' };
  }
}

/**
 * Get my orders (as customer)
 */
export async function getMyLocalOrders(status?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    let query = supabase
      .from('local_delivery_orders')
      .select(
        `
        *,
        local_couriers (
          courier_name,
          phone,
          whatsapp,
          profile_photo
        )
      `
      )
      .eq('customer_id', user.id)
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

/**
 * Update order status (for courier)
 */
export async function updateLocalOrderStatus(
  orderId: string,
  status: 'accepted' | 'picking_up' | 'picked_up' | 'delivering' | 'delivered'
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify courier owns this order
    const { data: courier } = await supabase
      .from('local_couriers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!courier) {
      return { success: false, error: 'Not a courier' };
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set timestamps
    if (status === 'accepted')
      updateData.accepted_at = new Date().toISOString();
    if (status === 'picked_up')
      updateData.picked_up_at = new Date().toISOString();
    if (status === 'delivered')
      updateData.delivered_at = new Date().toISOString();

    const { error } = await supabase
      .from('local_delivery_orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('courier_id', courier.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/courier');
    return { success: true, message: `Order status updated to ${status}` };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Get review link for order
 */
export function getReviewLink(orderId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || ''}/review/${orderId}`;
}
