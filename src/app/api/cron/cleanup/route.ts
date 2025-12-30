import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CRON CLEANUP API ENDPOINT
// ============================================
// URL: /api/cron/cleanup
// Method: POST
// Auth: CRON_SECRET header required
//
// Call this endpoint weekly via:
// - cron-job.org
// - Vercel Cron
// - Manual trigger

const CRON_SECRET = process.env.CRON_SECRET || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface CleanupResult {
  table: string;
  deletedCount: number;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');

    const providedSecret = cronSecret || authHeader?.replace('Bearer ', '');

    if (!CRON_SECRET) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Supabase Admin Client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: CleanupResult[] = [];

    // 1. Cleanup expired cached_resi
    try {
      const { data, error } = await supabase
        .from('cached_resi')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      results.push({
        table: 'cached_resi',
        deletedCount: data?.length || 0,
        success: !error,
        error: error?.message,
      });
    } catch (e) {
      results.push({
        table: 'cached_resi',
        deletedCount: 0,
        success: false,
        error: (e as Error).message,
      });
    }

    // 2. Cleanup old search_history (30 days)
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('search_history')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .select('id');

      results.push({
        table: 'search_history',
        deletedCount: data?.length || 0,
        success: !error,
        error: error?.message,
      });
    } catch (e) {
      results.push({
        table: 'search_history',
        deletedCount: 0,
        success: false,
        error: (e as Error).message,
      });
    }

    // 3. Cleanup old api_request_logs (90 days)
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data, error } = await supabase
        .from('api_request_logs')
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString())
        .select('id');

      results.push({
        table: 'api_request_logs',
        deletedCount: data?.length || 0,
        success: !error,
        error: error?.message,
      });
    } catch (e) {
      results.push({
        table: 'api_request_logs',
        deletedCount: 0,
        success: false,
        error: (e as Error).message,
      });
    }

    // 4. Reset monthly API quotas (if first day of month)
    const today = new Date();
    if (today.getDate() === 1) {
      try {
        const { data, error } = await supabase
          .from('api_keys')
          .update({ requests_count: 0 })
          .eq('is_active', true)
          .select('id');

        results.push({
          table: 'api_keys (quota reset)',
          deletedCount: data?.length || 0,
          success: !error,
          error: error?.message,
        });
      } catch (e) {
        results.push({
          table: 'api_keys (quota reset)',
          deletedCount: 0,
          success: false,
          error: (e as Error).message,
        });
      }
    }

    // Calculate totals
    const totalDeleted = results.reduce((sum, r) => sum + r.deletedCount, 0);
    const allSuccess = results.every((r) => r.success);
    const duration = Date.now() - startTime;

    // Log cleanup run
    console.log(
      `[Cleanup] Completed in ${duration}ms, deleted ${totalDeleted} records`
    );

    return NextResponse.json({
      success: allSuccess,
      message: `Cleanup completed. Deleted ${totalDeleted} records.`,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('[Cleanup] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup failed',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing (with secret in query)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== CRON_SECRET) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        usage: 'POST /api/cron/cleanup with x-cron-secret header',
      },
      { status: 401 }
    );
  }

  // Forward to POST handler
  return POST(request);
}
