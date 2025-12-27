import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rate Limit Middleware
 * Protects routes from brute force attacks
 */

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Rate limit configurations
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
    '/login': { limit: 5, window: 60 },           // 5 per minute
    '/register': { limit: 3, window: 60 },        // 3 per minute
    '/auth': { limit: 5, window: 60 },            // 5 per minute
    '/api/v1/track': { limit: 20, window: 60 },   // 20 per minute (public)
    '/api/track': { limit: 20, window: 60 },      // 20 per minute
    '/api/ongkir': { limit: 30, window: 60 },     // 30 per minute
    '/api/ai': { limit: 10, window: 60 },         // 10 per minute
};

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');

    if (forwarded) return forwarded.split(',')[0].trim();
    if (real) return real;
    return 'unknown';
}

function checkRateLimit(key: string, limit: number, windowSec: number): {
    allowed: boolean;
    remaining: number;
    reset: number;
} {
    const now = Date.now();
    const windowMs = windowSec * 1000;

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + windowMs };
        rateLimitStore.set(key, entry);
    }

    entry.count++;

    return {
        allowed: entry.count <= limit,
        remaining: Math.max(0, limit - entry.count),
        reset: Math.ceil(entry.resetAt / 1000),
    };
}

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
    const { pathname } = request.nextUrl;
    const ip = getClientIP(request);

    // Find matching rate limit config
    let config: { limit: number; window: number } | undefined;

    for (const [path, cfg] of Object.entries(RATE_LIMITS)) {
        if (pathname.startsWith(path)) {
            config = cfg;
            break;
        }
    }

    if (!config) return null; // No rate limit for this path

    const key = `${pathname}:${ip}`;
    const result = checkRateLimit(key, config.limit, config.window);

    if (!result.allowed) {
        // Return rate limit response
        const response = new NextResponse(
            JSON.stringify({
                error: 'Too Many Requests',
                message: 'Anda terlalu sering melakukan request. Silakan tunggu beberapa saat.',
                retryAfter: result.reset - Math.floor(Date.now() / 1000),
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'X-RateLimit-Limit': config.limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': result.reset.toString(),
                    'Retry-After': (result.reset - Math.floor(Date.now() / 1000)).toString(),
                },
            }
        );

        return response;
    }

    return null; // Allow request
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now > entry.resetAt) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

export default rateLimitMiddleware;
