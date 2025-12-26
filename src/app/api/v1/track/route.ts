import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ============================================
// PUBLIC API: /api/v1/track
// ============================================
// B2B API endpoint for tracking packages

const BINDERBYTE_API_KEY = process.env.BINDERBYTE_API_KEY || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// CORS headers for public API
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export async function OPTIONS() {
    return new NextResponse(null, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
    const startTime = Date.now()

    try {
        // Get API key from header
        const apiKey = request.headers.get('x-api-key')

        if (!apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'MISSING_API_KEY',
                        message: 'API key is required. Add x-api-key header.',
                    }
                },
                { status: 401, headers: corsHeaders }
            )
        }

        // Validate API key
        const validation = await validateApiKey(apiKey)

        if (!validation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_API_KEY',
                        message: validation.error,
                    }
                },
                { status: 401, headers: corsHeaders }
            )
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const awb = searchParams.get('awb')
        const courier = searchParams.get('courier')

        if (!awb) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'MISSING_AWB',
                        message: 'AWB (tracking number) is required. Add ?awb=YOUR_TRACKING_NUMBER',
                    }
                },
                { status: 400, headers: corsHeaders }
            )
        }

        if (!courier) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'MISSING_COURIER',
                        message: 'Courier code is required. Add &courier=jne|jnt|sicepat|anteraja|pos|ninja',
                    }
                },
                { status: 400, headers: corsHeaders }
            )
        }

        // Check cache first
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        const { data: cached } = await supabase
            .from('cached_resi')
            .select('tracking_json')
            .eq('resi', awb.toUpperCase())
            .eq('courier', courier.toLowerCase())
            .gt('expires_at', new Date().toISOString())
            .single()

        let trackingData
        let fromCache = false

        if (cached) {
            trackingData = cached.tracking_json
            fromCache = true
        } else {
            // Fetch from BinderByte API
            const apiResponse = await fetch(
                `https://api.binderbyte.com/v1/track?api_key=${BINDERBYTE_API_KEY}&courier=${courier}&awb=${awb}`
            )

            const apiData = await apiResponse.json()

            if (apiData.status !== 200) {
                // Log failed request
                await logApiRequest(supabase, validation.keyId!, '/api/v1/track', 'GET', 404, Date.now() - startTime, request)

                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'TRACKING_NOT_FOUND',
                            message: apiData.message || 'Tracking data not found',
                        }
                    },
                    { status: 404, headers: corsHeaders }
                )
            }

            trackingData = apiData.data

            // Cache the result (1 hour)
            await supabase
                .from('cached_resi')
                .upsert({
                    resi: awb.toUpperCase(),
                    courier: courier.toLowerCase(),
                    tracking_json: trackingData,
                    expires_at: new Date(Date.now() + 3600000).toISOString(),
                })
        }

        // Log successful request
        await logApiRequest(supabase, validation.keyId!, '/api/v1/track', 'GET', 200, Date.now() - startTime, request)

        // Return formatted response
        return NextResponse.json(
            {
                success: true,
                data: {
                    awb: awb.toUpperCase(),
                    courier: courier.toLowerCase(),
                    status: trackingData.summary?.status || trackingData.status?.status,
                    description: trackingData.summary?.desc || trackingData.status?.desc,
                    shipper: trackingData.detail?.shipper || null,
                    receiver: trackingData.detail?.receiver || null,
                    origin: trackingData.detail?.origin || null,
                    destination: trackingData.detail?.destination || null,
                    history: trackingData.history || [],
                },
                meta: {
                    cached: fromCache,
                    remaining_quota: validation.remainingQuota,
                    response_time_ms: Date.now() - startTime,
                }
            },
            { headers: corsHeaders }
        )

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An internal error occurred',
                }
            },
            { status: 500, headers: corsHeaders }
        )
    }
}

// Validate API key
async function validateApiKey(apiKey: string): Promise<{
    valid: boolean
    error?: string
    keyId?: string
    remainingQuota?: number
}> {
    if (!apiKey.startsWith('ck_live_')) {
        return { valid: false, error: 'Invalid API key format' }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const keyHash = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex')

    const { data, error } = await supabase
        .from('api_keys')
        .select('id, requests_count, requests_limit, is_active, expires_at')
        .eq('key_hash', keyHash)
        .single()

    if (error || !data) {
        return { valid: false, error: 'Invalid API key' }
    }

    if (!data.is_active) {
        return { valid: false, error: 'API key has been revoked' }
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, error: 'API key has expired' }
    }

    if (data.requests_count >= data.requests_limit) {
        return { valid: false, error: 'Monthly quota exceeded. Upgrade your plan.' }
    }

    // Increment usage counter
    await supabase
        .from('api_keys')
        .update({
            requests_count: data.requests_count + 1,
            last_used_at: new Date().toISOString(),
        })
        .eq('id', data.id)

    return {
        valid: true,
        keyId: data.id,
        remainingQuota: data.requests_limit - data.requests_count - 1,
    }
}

// Log API request
async function logApiRequest(
    supabase: any,
    keyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    request: NextRequest
) {
    await supabase.from('api_request_logs').insert({
        api_key_id: keyId,
        endpoint,
        method,
        status_code: statusCode,
        response_time_ms: responseTime,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
    })
}
