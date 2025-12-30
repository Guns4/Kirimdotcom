'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface SubmitReviewParams {
  courierCode: string;
  courierName: string;
  rating: number;
  comment?: string;
  resiNumber?: string;
}

export interface ReviewResult {
  success: boolean;
  error?: string;
  reviewId?: string;
}

export interface CourierStats {
  courier_code: string;
  courier_name: string;
  total_reviews: number;
  average_rating: number;
  positive_reviews: number;
  negative_reviews: number;
  neutral_reviews: number;
}

// Sentiment analysis (simple keyword-based)
function analyzeSentiment(
  comment: string = '',
  rating: number
): 'positive' | 'negative' | 'neutral' {
  // If no comment, use rating
  if (!comment) {
    if (rating >= 4) return 'positive';
    if (rating <= 2) return 'negative';
    return 'neutral';
  }

  const lowerComment = comment.toLowerCase();

  const positiveKeywords = [
    'bagus',
    'cepat',
    'baik',
    'mantap',
    'recommended',
    'aman',
    'tepat waktu',
    'puas',
    'excellent',
    'great',
  ];
  const negativeKeywords = [
    'lama',
    'lambat',
    'buruk',
    'jelek',
    'rusak',
    'hilang',
    'telat',
    'kecewa',
    'bad',
    'slow',
  ];

  const positiveCount = positiveKeywords.filter((word) =>
    lowerComment.includes(word)
  ).length;
  const negativeCount = negativeKeywords.filter((word) =>
    lowerComment.includes(word)
  ).length;

  if (positiveCount > negativeCount && rating >= 4) return 'positive';
  if (negativeCount > positiveCount && rating <= 2) return 'negative';

  // Default based on rating
  if (rating >= 4) return 'positive';
  if (rating <= 2) return 'negative';
  return 'neutral';
}

export async function submitCourierReview(
  params: SubmitReviewParams
): Promise<ReviewResult> {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Get current user (optional - allow anonymous)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Analyze sentiment
    const sentiment = analyzeSentiment(params.comment, params.rating);

    // Insert review
    const { data, error } = await supabase
      .from('courier_reviews')
      .insert({
        user_id: user?.id || null,
        courier_code: params.courierCode,
        courier_name: params.courierName,
        rating: params.rating,
        comment: params.comment || null,
        sentiment,
        resi_number: params.resiNumber || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Review submission error:', error);
      return {
        success: false,
        error: 'Gagal menyimpan review. Silakan coba lagi.',
      };
    }

    return {
      success: true,
      reviewId: data.id,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Silakan coba lagi.',
    };
  }
}

export async function getCourierStatistics(
  period: 'week' | 'month' | 'all' = 'month'
): Promise<CourierStats[]> {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase.rpc('get_courier_statistics', {
      time_period: period,
    });

    if (error) {
      console.error('Stats fetch error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}

export async function getRecentReviews(limit: number = 10) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase
      .from('courier_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Recent reviews error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
}
