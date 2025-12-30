'use server';

import { createClient } from '@/utils/supabase/server';

// ============================================
// TRACKING SUBSCRIPTION SERVER ACTIONS
// ============================================

interface SubscribeToTrackingParams {
  resi: string;
  courierCode: string;
  email?: string;
  whatsapp?: string;
  currentStatus?: string;
}

interface TrackingSubscription {
  id: string;
  resi: string;
  courier_code: string;
  email: string | null;
  whatsapp: string | null;
  last_status: string | null;
  is_active: boolean;
  created_at: string;
}

export async function subscribeToTracking(
  params: SubscribeToTrackingParams
): Promise<{ success: boolean; error?: string; subscriptionId?: string }> {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: 'Silakan login untuk menggunakan fitur ini',
    };
  }

  const { resi, courierCode, email, whatsapp, currentStatus } = params;

  // Validate contact info
  if (!email && !whatsapp) {
    return { success: false, error: 'Masukkan email atau nomor WhatsApp' };
  }

  // Check for existing subscription
  const { data: existing } = await (supabase as any)
    .from('tracking_subscriptions')
    .select('id, is_active')
    .eq('user_id', user.id)
    .eq('resi', resi)
    .single();

  if (existing) {
    if (existing.is_active) {
      return {
        success: false,
        error: 'Anda sudah berlangganan notifikasi untuk resi ini',
      };
    }

    // Reactivate existing subscription
    const { error } = await (supabase as any)
      .from('tracking_subscriptions')
      .update({
        is_active: true,
        email: email || null,
        whatsapp: whatsapp || null,
        last_status: currentStatus || null,
      })
      .eq('id', existing.id);

    if (error) {
      return { success: false, error: 'Gagal mengaktifkan kembali langganan' };
    }

    return { success: true, subscriptionId: existing.id };
  }

  // Create new subscription
  const { data, error } = await (supabase as any)
    .from('tracking_subscriptions')
    .insert({
      user_id: user.id,
      resi: resi.toUpperCase(),
      courier_code: courierCode.toLowerCase(),
      email: email || null,
      whatsapp: whatsapp || null,
      last_status: currentStatus || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Subscribe error:', error);
    return { success: false, error: 'Gagal membuat langganan notifikasi' };
  }

  return { success: true, subscriptionId: data.id };
}

export async function unsubscribeFromTracking(
  resi: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Tidak terautentikasi' };
  }

  const { error } = await (supabase as any)
    .from('tracking_subscriptions')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('resi', resi);

  if (error) {
    return { success: false, error: 'Gagal membatalkan langganan' };
  }

  return { success: true };
}

export async function getMyTrackingSubscriptions(): Promise<
  TrackingSubscription[]
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await (supabase as any)
    .from('tracking_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get subscriptions error:', error);
    return [];
  }

  return data || [];
}

export async function checkSubscriptionStatus(
  resi: string
): Promise<{ isSubscribed: boolean; email?: string; whatsapp?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isSubscribed: false };
  }

  const { data } = await (supabase as any)
    .from('tracking_subscriptions')
    .select('email, whatsapp, is_active')
    .eq('user_id', user.id)
    .eq('resi', resi.toUpperCase())
    .single();

  if (!data || !data.is_active) {
    return { isSubscribed: false };
  }

  return {
    isSubscribed: true,
    email: data.email,
    whatsapp: data.whatsapp,
  };
}
