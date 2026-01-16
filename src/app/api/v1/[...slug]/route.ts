import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// API Gateway - V1
// Validates API keys and forwards to internal services
// ==========================================

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(req, resolvedParams, 'GET');
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(req, resolvedParams, 'POST');
}

async function handleRequest(
  req: Request,
  { slug }: { slug: string[] },
  method: string
) {
  const startTime = Date.now();

  try {
    // ==========================================
    // 1. Extract API Key
    // ==========================================
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key. Include x-api-key header.' },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. Validate API Key
    // ==========================================
    const { data: keyData, error: keyError } = await supabase
      .from('saas_api_keys')
      .select('*, users(id, email)')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      console.warn('[API Gateway] Invalid API key attempt');
      return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
    }

    // ==========================================
    // 3. Check Quota
    // ==========================================
    if (keyData.quota_limit && keyData.request_count >= keyData.quota_limit) {
      return NextResponse.json(
        { error: 'API quota exceeded. Upgrade your plan.' },
        { status: 429 }
      );
    }

    // ==========================================
    // 4. Route to Internal Service
    // ==========================================
    const endpoint = slug.join('/');
    let response;

    if (endpoint === 'shipping/cost' && method === 'POST') {
      const body = await req.json();

      // Call internal shipping service
      const internalRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/shipping/cost`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      response = await internalRes.json();
    } else if (endpoint.startsWith('tracking/') && method === 'GET') {
      const resiNumber = endpoint.split('/')[1];

      // Call internal tracking service
      const internalRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/tracking/${resiNumber}`
      );
      response = await internalRes.json();
    } else {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      );
    }

    // ==========================================
    // 5. Log Usage
    // ==========================================
    const responseTime = Date.now() - startTime;

    await supabase.from('saas_usage_logs').insert({
      user_id: keyData.user_id,
      api_key_id: keyData.id,
      endpoint: `/api/v1/${endpoint}`,
      method,
      status_code: 200,
      response_time: responseTime,
    });

    // Increment request count
    await supabase
      .from('saas_api_keys')
      .update({ request_count: (keyData.request_count || 0) + 1 })
      .eq('id', keyData.id);

    console.log(
      `[API Gateway] ${method} /v1/${endpoint} - ${responseTime}ms - User: ${keyData.users.email}`
    );

    return NextResponse.json({
      ...response,
      meta: {
        request_id: `req_${Date.now()}`,
        response_time_ms: responseTime,
      },
    });
  } catch (error: any) {
    console.error('[API Gateway] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
