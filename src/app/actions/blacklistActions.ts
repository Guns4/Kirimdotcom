'use server';

import { createClient } from '@/utils/supabase/server';

interface RiskCheckResult {
  success: boolean;
  data?: {
    phone: string;
    totalReports: number;
    riskLevel: string;
    riskScore: number;
    breakdown: any;
    message: string;
    color: string;
  };
  error?: string;
}

/**
 * Check customer risk by phone number
 */
export async function checkCustomerRisk(
  phoneNumber: string
): Promise<RiskCheckResult> {
  try {
    const supabase = await createClient();

    // Normalize phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      return {
        success: false,
        error: 'Invalid phone number',
      };
    }

    // Calculate risk
    const { data, error } = await (supabase as any).rpc(
      'calculate_customer_risk',
      {
        p_customer_phone: cleanPhone,
      }
    );

    if (error || !data || data.length === 0) {
      return {
        success: true,
        data: {
          phone: cleanPhone,
          totalReports: 0,
          riskLevel: 'unknown',
          riskScore: 0,
          breakdown: {},
          message: 'Aman / Belum Ada Data',
          color: 'gray',
        },
      };
    }

    const result = data[0];
    let message = '';
    let color = '';

    switch (result.risk_level) {
      case 'danger':
        message = `⚠️ BAHAYA! ${result.total_reports} laporan (${result.risk_score} poin)`;
        color = 'red';
        break;
      case 'caution':
        message = `⚡ Waspada! ${result.total_reports} laporan (${result.risk_score} poin)`;
        color = 'yellow';
        break;
      case 'safe':
        message = `✓ Cukup Aman (${result.total_reports} laporan minor)`;
        color = 'green';
        break;
      default:
        message = 'Aman / Belum Ada Data';
        color = 'gray';
    }

    return {
      success: true,
      data: {
        phone: cleanPhone,
        totalReports: result.total_reports,
        riskLevel: result.risk_level,
        riskScore: result.risk_score,
        breakdown: result.breakdown,
        message,
        color,
      },
    };
  } catch (error) {
    console.error('Error checking customer risk:', error);
    return {
      success: false,
      error: 'System error',
    };
  }
}

/**
 * Submit blacklist report
 */
export async function submitBlacklistReport(
  customerPhone: string,
  customerName: string,
  reason: string,
  description: string,
  proofImageUrl: string
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');

    const { data, error } = await (supabase as any).rpc(
      'submit_blacklist_report',
      {
        p_reporter_id: user.id,
        p_customer_phone: cleanPhone,
        p_customer_name: customerName,
        p_reason: reason,
        p_description: description,
        p_proof_url: proofImageUrl,
      }
    );

    if (error) {
      console.error('Error submitting report:', error);
      return {
        success: false,
        error: 'Failed to submit report',
      };
    }

    return {
      success: true,
      message: 'Laporan berhasil dikirim! Akan diverifikasi oleh admin.',
      reportId: data,
    };
  } catch (error) {
    console.error('Error in submitBlacklistReport:', error);
    return {
      success: false,
      error: 'System error',
    };
  }
}

/**
 * Get user's submitted reports
 */
export async function getMyReports() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await (supabase as any)
      .from('blacklist_reports')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching reports:', error);
    return { data: null, error: 'Failed to fetch reports' };
  }
}
