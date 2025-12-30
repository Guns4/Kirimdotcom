'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getAffiliateCode } from '@/utils/affiliateTracking';

interface AffiliateResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Register user as an affiliate
 */
export async function registerAffiliate(
  displayName: string,
  customCode?: string
): Promise<AffiliateResult> {
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

    // Check if already registered
    const { data: existing } = await (supabase as any)
      .from('affiliate_users')
      .select('id, affiliate_code')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return {
        success: false,
        message: 'Anda sudah terdaftar sebagai affiliate',
        error: 'ALREADY_REGISTERED',
        data: existing,
      };
    }

    // Generate affiliate code
    let affiliateCode = customCode;
    if (!affiliateCode) {
      const { data: generatedCode } = await (supabase as any).rpc(
        'generate_affiliate_code',
        {
          user_email: user.email || '',
        }
      );
      affiliateCode = generatedCode;
    }

    // Create affiliate record
    const { data: affiliate, error: createError } = await (supabase as any)
      .from('affiliate_users')
      .insert({
        user_id: user.id,
        affiliate_code: affiliateCode,
        display_name: displayName,
        email: user.email,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('Affiliate registration error:', createError);
      return {
        success: false,
        message: 'Gagal mendaftar sebagai affiliate',
        error: 'REGISTRATION_FAILED',
      };
    }

    revalidatePath('/dashboard/affiliate');

    return {
      success: true,
      message: 'Selamat! Anda sekarang menjadi affiliate kami',
      data: affiliate,
    };
  } catch (error) {
    console.error('Unexpected error in registerAffiliate:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan sistem',
      error: 'SYSTEM_ERROR',
    };
  }
}

/**
 * Track affiliate click
 */
export async function trackAffiliateClick(
  affiliateCode: string,
  productType?: string,
  productId?: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // Get affiliate user
    const { data: affiliate } = await (supabase as any)
      .from('affiliate_users')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .eq('is_active', true)
      .single();

    if (!affiliate) {
      console.warn('Affiliate not found:', affiliateCode);
      return;
    }

    // Record click
    await (supabase as any).from('affiliate_clicks').insert({
      affiliate_user_id: affiliate.id,
      affiliate_code: affiliateCode,
      product_type: productType,
      product_id: productId,
      landing_page: typeof window !== 'undefined' ? window.location.href : '',
    });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
  }
}

/**
 * Record affiliate commission when purchase is made
 */
export async function recordAffiliateCommission(
  purchaseId: string,
  purchaseType: string,
  purchaseAmount: number
): Promise<AffiliateResult> {
  try {
    const supabase = await createClient();

    // Get affiliate code from cookie
    const affiliateCode = await getAffiliateCode();
    if (!affiliateCode) {
      return {
        success: false,
        message: 'No affiliate referral',
        error: 'NO_REFERRAL',
      };
    }

    // Get affiliate user
    const { data: affiliate } = await (supabase as any)
      .from('affiliate_users')
      .select('id, affiliate_code')
      .eq('affiliate_code', affiliateCode)
      .eq('is_active', true)
      .single();

    if (!affiliate) {
      return {
        success: false,
        message: 'Affiliate not found',
        error: 'AFFILIATE_NOT_FOUND',
      };
    }

    // Get commission rate from program
    const { data: program } = await (supabase as any)
      .from('affiliate_programs')
      .select('commission_rate')
      .eq('program_slug', 'digital-products-affiliate')
      .eq('is_active', true)
      .single();

    const commissionRate = program?.commission_rate || 20;
    const commissionAmount =
      Math.round(((purchaseAmount * commissionRate) / 100) * 100) / 100;

    // Record earning
    const { data: earning, error: earningError } = await (supabase as any)
      .from('affiliate_earnings')
      .insert({
        affiliate_user_id: affiliate.id,
        affiliate_code: affiliate.affiliate_code,
        purchase_type: purchaseType,
        purchase_id: purchaseId,
        purchase_amount: purchaseAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        status: 'pending', // Will be approved by admin
      })
      .select()
      .single();

    if (earningError) {
      console.error('Error recording commission:', earningError);
      return {
        success: false,
        message: 'Failed to record commission',
        error: 'COMMISSION_FAILED',
      };
    }

    return {
      success: true,
      message: 'Commission recorded successfully',
      data: earning,
    };
  } catch (error) {
    console.error('Unexpected error in recordAffiliateCommission:', error);
    return {
      success: false,
      message: 'System error',
      error: 'SYSTEM_ERROR',
    };
  }
}

/**
 * Get affiliate dashboard stats
 */
export async function getAffiliateDashboardStats() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Get affiliate profile
    const { data: affiliate } = await (supabase as any)
      .from('affiliate_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      return { data: null, error: 'Not registered as affiliate' };
    }

    // Get earnings summary
    const { data: earnings } = await (supabase as any)
      .from('affiliate_earnings')
      .select('*')
      .eq('affiliate_user_id', affiliate.id)
      .order('earned_at', { ascending: false });

    // Calculate stats
    const stats = {
      totalClicks: affiliate.total_referrals || 0,
      totalEarnings: affiliate.total_earnings || 0,
      availableBalance: affiliate.available_balance || 0,
      totalWithdrawn: affiliate.total_withdrawn || 0,
      pendingEarnings:
        earnings
          ?.filter((e: any) => e.status === 'pending')
          .reduce(
            (sum: number, e: any) => sum + parseFloat(e.commission_amount),
            0
          ) || 0,
      approvedEarnings:
        earnings
          ?.filter((e: any) => e.status === 'approved')
          .reduce(
            (sum: number, e: any) => sum + parseFloat(e.commission_amount),
            0
          ) || 0,
      recentEarnings: earnings?.slice(0, 10) || [],
    };

    return { data: { affiliate, stats, earnings }, error: null };
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return { data: null, error: 'Failed to fetch stats' };
  }
}

/**
 * Request withdrawal
 */
export async function requestWithdrawal(
  amount: number,
  paymentMethod: string,
  paymentDetails: any
): Promise<AffiliateResult> {
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

    // Get affiliate profile
    const { data: affiliate } = await (supabase as any)
      .from('affiliate_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      return {
        success: false,
        message: 'Not registered as affiliate',
        error: 'NOT_AFFILIATE',
      };
    }

    // Check available balance
    if (affiliate.available_balance < amount) {
      return {
        success: false,
        message: 'Insufficient balance',
        error: 'INSUFFICIENT_BALANCE',
      };
    }

    // Minimum withdrawal check
    if (amount < 50000) {
      return {
        success: false,
        message: 'Minimum withdrawal is Rp 50,000',
        error: 'BELOW_MINIMUM',
      };
    }

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await (supabase as any)
      .from('affiliate_withdrawals')
      .insert({
        affiliate_user_id: affiliate.id,
        amount: amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: 'pending',
      })
      .select()
      .single();

    if (withdrawalError) {
      return {
        success: false,
        message: 'Failed to create withdrawal request',
        error: 'WITHDRAWAL_FAILED',
      };
    }

    revalidatePath('/dashboard/affiliate');

    return {
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal,
    };
  } catch (error) {
    console.error('Error in requestWithdrawal:', error);
    return {
      success: false,
      message: 'System error',
      error: 'SYSTEM_ERROR',
    };
  }
}
