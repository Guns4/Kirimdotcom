import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const ratelimitPublic = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
});

// Authenticated users: 50 requests per 10 seconds
export const ratelimitAuth = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(50, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit/auth',
});

export async function checkRateLimit(identifier: string, type: 'PUBLIC' | 'AUTH' = 'PUBLIC') {
    if (process.env.NODE_ENV === 'development') return { success: true, limit: 100, remaining: 99, reset: 0 };

    const limiter = type === 'AUTH' ? ratelimitAuth : ratelimitPublic;

    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    return { success, limit, reset, remaining };
}
