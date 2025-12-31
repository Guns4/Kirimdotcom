import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export interface H2HPartner {
    id: string;
    user_id: string;
    name: string;
    ip_whitelist: string[] | null;
    is_active: boolean;
}

export interface H2HResponse {
    status: boolean;
    response_code: number;
    message: string;
    data?: any;
}

export async function validateH2HRequest(request: Request): Promise<{
    partner?: H2HPartner;
    errorResponse?: NextResponse;
    body?: any
}> {
    const supabase = await createClient();
    const apiKey = request.headers.get('X-API-Key');

    // 1. Check API Key presence
    if (!apiKey) {
        return {
            errorResponse: NextResponse.json({
                status: false,
                response_code: 401,
                message: 'Unauthorized: Missing API Key'
            }, { status: 401 })
        };
    }

    // 2. Validate API Key
    const { data: partner, error } = await (supabase as any)
        .from('h2h_partners')
        .select('*')
        .eq('api_key', apiKey)
        .eq('is_active', true)
        .single();

    if (error || !partner) {
        return {
            errorResponse: NextResponse.json({
                status: false,
                response_code: 401,
                message: 'Unauthorized: Invalid API Key'
            }, { status: 401 })
        };
    }

    // 3. Check IP Whitelist
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    // Simplified IP check for MVP. In production, parse IP properly.
    // If whitelist exists and IP is not in it (and IP is available)
    if (partner.ip_whitelist && partner.ip_whitelist.length > 0) {
        // Very basic inclusion check. 
        // Note: x-forwarded-for can contain multiple IPs.
        const requestIps = ip.split(',').map(s => s.trim());
        const isAllowed = partner.ip_whitelist.some((allowedIp: string) =>
            requestIps.includes(allowedIp)
        );

        if (!isAllowed && ip !== 'unknown') {
            return {
                errorResponse: NextResponse.json({
                    status: false,
                    response_code: 403,
                    message: `Forbidden: IP ${ip} not allowed`
                }, { status: 403 })
            };
        }
    }

    // 4. Parse Body (if POST)
    let body = null;
    if (request.method === 'POST') {
        try {
            body = await request.json();
        } catch (e) {
            return {
                errorResponse: NextResponse.json({
                    status: false,
                    response_code: 400,
                    message: 'Bad Request: Invalid JSON'
                }, { status: 400 })
            };
        }
    }

    return { partner, body };
}

export function successResponse(data: any, message = 'Success'): NextResponse {
    return NextResponse.json({
        status: true,
        response_code: 200,
        message,
        data
    });
}

export function errorResponse(message: string, code = 400): NextResponse {
    return NextResponse.json({
        status: false,
        response_code: code,
        message,
        data: null
    }, { status: code });
}
