import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Rate limiting configuration
 */
const RATE_LIMITS: Record<string, { maxRequests: number; windowSeconds: number }> = {
    '/api/v1/track': { maxRequests: 100, windowSeconds: 60 },
    '/api/v1/ongkir': { maxRequests: 100, windowSeconds: 60 },
    '/api/cek-resi': { maxRequests: 60, windowSeconds: 60 },
    '/api/cek-ongkir': { maxRequests: 60, windowSeconds: 60 },
    default: { maxRequests: 200, windowSeconds: 60 },
};

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    return '127.0.0.1';
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
    request: NextRequest,
    endpoint: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
    const ip = getClientIP(request);
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;

    try {
        const supabase = await createClient();

        const { data, error } = await supabase.rpc('check_rate_limit', {
            p_identifier: ip,
            p_identifier_type: 'ip',
            p_endpoint: endpoint,
            p_max_requests: config.maxRequests,
            p_window_seconds: config.windowSeconds,
        });

        if (error || !data || data.length === 0) {
            // Fail open
            return { allowed: true };
        }

        const result = data[0];

        if (!result.is_allowed) {
            return {
                allowed: false,
                response: NextResponse.json(
                    {
                        error: 'Rate limit exceeded',
                        message: `Max ${config.maxRequests} requests per ${config.windowSeconds} seconds`,
                        retryAfter: result.reset_at,
                    },
                    {
                        status: 429,
                        headers: {
                            'Retry-After': String(config.windowSeconds),
                            'X-RateLimit-Limit': String(config.maxRequests),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': result.reset_at,
                        },
                    }
                ),
            };
        }

        return { allowed: true };
    } catch (error) {
        console.error('Rate limit error:', error);
        return { allowed: true };
    }
}

/**
 * Sanitize input to prevent SQL injection
 * Note: Supabase SDK already uses parameterized queries,
 * but this adds an extra layer for user input validation
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    // Remove common SQL injection patterns
    const dangerous = [
        /--/g,
        /;/g,
        /'/g,
        /"/g,
        /\\/g,
        /\/\*/g,
        /\*\//g,
        /xp_/gi,
        /UNION/gi,
        /SELECT/gi,
        /INSERT/gi,
        /UPDATE/gi,
        /DELETE/gi,
        /DROP/gi,
        /EXEC/gi,
        /EXECUTE/gi,
        /<script/gi,
        /javascript:/gi,
    ];

    let sanitized = input;
    for (const pattern of dangerous) {
        sanitized = sanitized.replace(pattern, '');
    }

    return sanitized.trim();
}

/**
 * Validate AWB number format
 */
export function validateAWB(awb: string): boolean {
    // Allow alphanumeric only, 8-30 chars
    const pattern = /^[A-Za-z0-9]{8,30}$/;
    return pattern.test(awb);
}

/**
 * Validate phone number format (Indonesia)
 */
export function validatePhone(phone: string): boolean {
    // Indonesia phone: 08xx or 628xx, 10-15 digits
    const pattern = /^(08|628)\d{8,13}$/;
    const cleaned = phone.replace(/\D/g, '');
    return pattern.test(cleaned);
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
    request: NextRequest,
    reason: string,
    details?: any
) {
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
        const supabase = await createClient();

        await supabase.rpc('log_security_event', {
            p_event_type: 'suspicious_activity',
            p_ip_address: ip,
            p_description: reason,
            p_severity: 'high',
            p_raw_data: JSON.stringify({
                userAgent,
                url: request.url,
                method: request.method,
                ...details,
            }),
        });
    } catch (error) {
        console.error('Failed to log suspicious activity:', error);
    }
}

/**
 * Security headers for API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    return response;
}
