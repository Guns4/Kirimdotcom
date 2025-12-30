'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface WARotatorResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Create a new WA rotator link
 */
export async function createWARotator(data: {
  linkName: string;
  slug: string;
  csNumbers: Array<{ number: string; name: string }>;
  defaultMessage: string;
}): Promise<WARotatorResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu',
        error: 'UNAUTHORIZED',
      };
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('wa_rotator_links')
      .select('id')
      .eq('slug', data.slug)
      .single();

    if (existing) {
      return {
        success: false,
        message: 'Slug sudah digunakan, silakan gunakan slug lain',
        error: 'SLUG_EXISTS',
      };
    }

    // Create rotator
    const { data: rotator, error: createError } = await supabase
      .from('wa_rotator_links')
      .insert({
        user_id: user.id,
        slug: data.slug,
        link_name: data.linkName,
        cs_numbers: data.csNumbers,
        default_message: data.defaultMessage,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create rotator error:', createError);
      return {
        success: false,
        message: 'Gagal membuat rotator',
        error: 'CREATE_FAILED',
      };
    }

    revalidatePath('/tools/wa-rotator');

    return {
      success: true,
      message: 'Link rotator berhasil dibuat!',
      data: rotator,
    };
  } catch (error) {
    console.error('Unexpected error in createWARotator:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan sistem',
      error: 'SYSTEM_ERROR',
    };
  }
}

/**
 * Get next CS number using round-robin
 */
export async function getNextCSNumber(slug: string): Promise<{
  cs: { number: string; name: string };
  index: number;
  totalCS: number;
  rotatorId: string;
  defaultMessage: string;
} | null> {
  try {
    const supabase = await createClient();

    // Get rotator by slug
    const { data: rotator } = await supabase
      .from('wa_rotator_links')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (!rotator) {
      return null;
    }

    // Call database function for round-robin
    const { data: result, error } = await supabase.rpc('get_next_cs_number', {
      rotator_uuid: rotator.id,
    });

    if (error || !result) {
      console.error('Error getting next CS:', error);
      return null;
    }

    return {
      cs: result.cs,
      index: result.index,
      totalCS: result.total_cs,
      rotatorId: rotator.id,
      defaultMessage: rotator.default_message || '',
    };
  } catch (error) {
    console.error('Unexpected error in getNextCSNumber:', error);
    return null;
  }
}

/**
 * Record click event
 */
export async function recordRotatorClick(
  rotatorId: string,
  slug: string,
  selectedCSNumber: string,
  selectedCSIndex: number
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.from('wa_rotator_clicks').insert({
      rotator_id: rotatorId,
      rotator_slug: slug,
      selected_cs_number: selectedCSNumber,
      selected_cs_index: selectedCSIndex,
    });
  } catch (error) {
    console.error('Error recording click:', error);
  }
}

/**
 * Record WhatsApp button click (conversion)
 */
export async function recordWAConversion(rotatorId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Update total conversions
    await supabase
      .from('wa_rotator_links')
      .update({
        total_conversions: supabase.raw('total_conversions + 1'),
      })
      .eq('id', rotatorId);
  } catch (error) {
    console.error('Error recording conversion:', error);
  }
}

/**
 * Get user's rotators
 */
export async function getUserRotators() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('wa_rotator_stats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching rotators:', error);
    return { data: null, error: 'Failed to fetch rotators' };
  }
}

/**
 * Delete rotator
 */
export async function deleteRotator(
  rotatorId: string
): Promise<WARotatorResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'UNAUTHORIZED',
      };
    }

    const { error } = await supabase
      .from('wa_rotator_links')
      .delete()
      .eq('id', rotatorId)
      .eq('user_id', user.id);

    if (error) {
      return {
        success: false,
        message: 'Failed to delete rotator',
        error: 'DELETE_FAILED',
      };
    }

    revalidatePath('/tools/wa-rotator');

    return {
      success: true,
      message: 'Rotator deleted successfully',
    };
  } catch (error) {
    console.error('Error in deleteRotator:', error);
    return {
      success: false,
      message: 'System error',
      error: 'SYSTEM_ERROR',
    };
  }
}
