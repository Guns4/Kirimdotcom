import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { hashKey } from './api-security';

/**
 * Pricing Configuration
 * Define costs per endpoint or use defaults
 */
const ENDPOINT_COSTS: Record<string, number> = {
    '/api/v1/track': 50,      // IDR 50 per tracking request
    '/api/v1/cost': 100,      // IDR 100 per cost calculation
    '/api/v1/webhook': 25,    // IDR 25 per webhook
    'default': 50             // Default cost for other endpoints
};

/**
 * Get cost for specific endpoint
 */
function getCost(endpoint: string): number {
    return ENDPOINT_COSTS[endpoint] || ENDPOINT_COSTS.default;
}

/**
 * Main metering function - validates API key and deducts balance atomically
 */
export async function handleMeteredRequest(req: NextRequest): Promise<NextResponse> {
    try {
        // 1. Extract API Key from Authorization header
        const authHeader = req.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing or invalid Authorization header',
                    code: 'MISSING_API_KEY'
                },
                { status: 401 }
            );
        }

        const rawKey = authHeader.replace('Bearer ', '').trim();

        if (!rawKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Empty API key',
                    code: 'INVALID_API_KEY'
                },
                { status: 401 }
            );
        }

        // 2. Hash the key for lookup
        const hashedKey = hashKey(rawKey);

        // 3. Determine cost
        const endpoint = req.nextUrl.pathname;
        const cost = getCost(endpoint);

        // 4. Call atomic metering function
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('meter_api_request', {
            p_key_hash: hashedKey,
            p_cost: cost,
            p_endpoint: endpoint,
            p_method: req.method,
            p_ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown'
        });

        // Handle RPC errors
        if (error) {
            console.error('Metering RPC Error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'System error during metering',
                    code: 'METERING_ERROR'
                },
                { status: 500 }
            );
        }

        // Check if we got valid response
        if (!data || data.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid metering response',
                    code: 'SYSTEM_ERROR'
                },
                { status: 500 }
            );
        }

        const result = data[0];

        // 5. Handle metering result
        if (!result.allowed) {
            const errorCode = result.error === 'Insufficient Balance'
                ? 'INSUFFICIENT_BALANCE'
                : result.error === 'API Key Disabled'
                    ? 'KEY_DISABLED'
                    : 'UNAUTHORIZED';

            const statusCode = result.error === 'Insufficient Balance' ? 402 : 401;

            return NextResponse.json(
                {
                    success: false,
                    error: result.error || 'Unauthorized',
                    code: errorCode,
                    ...(result.error === 'Insufficient Balance' && {
                        topup_url: '/dashboard/developer/billing'
                    })
                },
                { status: statusCode }
            );
        }

        // 6. Success - Attach user context to request headers
        const response = NextResponse.next();

        // Add custom headers for downstream route handlers
        response.headers.set('x-api-user-id', result.user_id);
        response.headers.set('x-api-key-id', result.key_id);
        response.headers.set('x-api-balance', result.new_balance.toString());
        response.headers.set('x-api-cost', cost.toString());

        return response;

    } catch (error) {
        console.error('Metering Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                code: 'SYSTEM_ERROR'
            },
            { status: 500 }
        );
    }
}

/**
 * Check if request should be metered (only /api/v1/* routes)
 */
export function shouldMeterRequest(pathname: string): boolean {
    return pathname.startsWith('/api/v1/');
}

/**
 * Get user context from metered request headers
 */
export function getUserContext(req: NextRequest) {
    return {
        userId: req.headers.get('x-api-user-id'),
        keyId: req.headers.get('x-api-key-id'),
        balance: parseInt(req.headers.get('x-api-balance') || '0'),
        cost: parseInt(req.headers.get('x-api-cost') || '0')
    };
}
