import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreditScoreResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Get seller's current credit score
 */
export async function getCreditScore() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Get latest score
    const { data, error } = await supabase
      .from('credit_score_history')
      .select('*')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching credit score:', error);
    return { data: null, error: 'Failed to fetch score' };
  }
}

/**
 * Get credit score history
 */
export async function getCreditScoreHistory(limit: number = 12) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('credit_score_history')
      .select('*')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching history:', error);
    return { data: null, error: 'Failed to fetch history' };
  }
}

/**
 * Request credit score recalculation
 */
export async function requestScoreRecalculation(): Promise<CreditScoreResult> {
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

    // Call database function
    const { data, error } = await supabase.rpc('recalculate_credit_score', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Error recalculating score:', error);
      return {
        success: false,
        message: 'Failed to recalculate score',
        error: 'CALCULATION_FAILED',
      };
    }

    revalidatePath('/dashboard/credit-score');

    return {
      success: true,
      message: 'Credit score recalculated successfully!',
      data: { historyId: data },
    };
  } catch (error) {
    console.error('Error in requestScoreRecalculation:', error);
    return {
      success: false,
      message: 'System error',
      error: 'SYSTEM_ERROR',
    };
  }
}

/**
 * Get seller performance metrics
 */
export async function getPerformanceMetrics() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('seller_performance_metrics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return { data: null, error: 'Failed to fetch metrics' };
  }
}

/**
 * Get risk category details
 */
export function getRiskCategoryDetails(category: string): {
  label: string;
  color: string;
  description: string;
  creditLimitSuggestion: string;
} {
  const categories: Record<string, any> = {
    excellent: {
      label: 'Excellent',
      color: 'green',
      description: 'Outstanding credit profile',
      creditLimitSuggestion: 'Up to Rp 10,000,000',
    },
    good: {
      label: 'Good',
      color: 'blue',
      description: 'Strong credit profile',
      creditLimitSuggestion: 'Up to Rp 5,000,000',
    },
    fair: {
      label: 'Fair',
      color: 'yellow',
      description: 'Average credit profile',
      creditLimitSuggestion: 'Up to Rp 2,500,000',
    },
    poor: {
      label: 'Poor',
      color: 'orange',
      description: 'Below average credit profile',
      creditLimitSuggestion: 'Up to Rp 1,000,000',
    },
    very_poor: {
      label: 'Very Poor',
      color: 'red',
      description: 'High risk credit profile',
      creditLimitSuggestion: 'Limited or no credit',
    },
    unrated: {
      label: 'Unrated',
      color: 'gray',
      description: 'Insufficient data',
      creditLimitSuggestion: 'Build transaction history first',
    },
  };

  return categories[category] || categories.unrated;
}

/**
 * Calculate suggested credit limit based on score
 */
export function calculateSuggestedCreditLimit(score: number): number {
  if (score >= 750) return 10000000; // Rp 10M
  if (score >= 700) return 5000000; // Rp 5M
  if (score >= 650) return 2500000; // Rp 2.5M
  if (score >= 600) return 1000000; // Rp 1M
  if (score >= 550) return 500000; // Rp 500K
  return 0; // Too risky
}
