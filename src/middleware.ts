import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory store for rate limiting
// Note: For production with multiple servers, use Upstash Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 20

// Protected patterns that require rate limiting
const PROTECTED_PATTERNS = [
    '/api/ai/generate-advice',
    // Add more patterns as needed
]

// Helper: Get client IP
function getClientIp(request: NextRequest): string {
    // Try various headers that might contain the real IP
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    // Fallback to a default (shouldn't happen in production)
    return '0.0.0.0'
}

// Helper: Check rate limit
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = rateLimitStore.get(ip)

    // No record or expired - allow and create new
    if (!record || now >= record.resetTime) {
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
        })
        return {
            allowed: true,
            remaining: MAX_REQUESTS_PER_WINDOW - 1,
            resetTime: now + RATE_LIMIT_WINDOW,
        }
    }

    // Record exists and not expired
    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        // Rate limit exceeded
        return {
            allowed: false,
            remaining: 0,
            resetTime: record.resetTime,
        }
    }

    // Increment count
    record.count++
    rateLimitStore.set(ip, record)

    return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - record.count,
        resetTime: record.resetTime,
    }
}

// Cleanup old entries periodically (prevent memory leak)
setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of rateLimitStore.entries()) {
        if (now >= record.resetTime) {
            rateLimitStore.delete(ip)
        }
    }
}, RATE_LIMIT_WINDOW) // Run cleanup every hour

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if path is protected
    const isProtected = PROTECTED_PATTERNS.some((pattern) =>
        pathname.startsWith(pattern)
    )

    if (!isProtected) {
        // Not protected, allow through
        return NextResponse.next()
    }

    // Get client IP
    const ip = getClientIp(request)

    // Check rate limit
    const { allowed, remaining, resetTime } = checkRateLimit(ip)

    if (!allowed) {
        // Rate limit exceeded
        const resetDate = new Date(resetTime)

        return NextResponse.json(
            {
                error: 'Too Many Requests',
                message: 'Anda telah mencapai batas maksimal request. Silakan coba lagi nanti.',
                retryAfter: Math.ceil((resetTime - Date.now()) / 1000), // seconds
                resetAt: resetDate.toISOString(),
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
                    'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.floor(resetTime / 1000)),
                },
            }
        )
    }

    // Add rate limit headers to response
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.floor(resetTime / 1000)))

    return response
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        // Match API routes that need rate limiting
        '/api/ai/:path*',
        // Add more patterns as needed
    ],
}
