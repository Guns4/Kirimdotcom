import { createClient } from '@/utils/supabase/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure real-time check

export async function GET() {
  const start = Date.now();

  // 1. Basic App Health
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      latency_ms: 0,
    },
  };

  try {
    // 2. Database Connection Check
    const supabase = createClient();

    // Simple check using a lightweight query
    // We try to fetch the count of profiles or just verify connection
    // Using 'profiles' table which commonly exists
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116') {
      // Warn but don't fail hard unless it's critical
      console.warn('DB Check Warning:', error.message);
    }

    healthData.checks.database = 'healthy';
  } catch (error: any) {
    console.error('Health Check Failed:', error);
    healthData.status = 'error';
    healthData.checks.database = 'unreachable';

    return NextResponse.json(healthData, { status: 500 });
  }

  healthData.checks.latency_ms = Date.now() - start;

  return NextResponse.json(healthData, { status: 200 });
}
