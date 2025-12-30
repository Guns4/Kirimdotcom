/**
 * Rate Limiter Utility
 * Uses in-memory store for development, Upstash Redis for production
 */

// In-memory store for development/fallback
const memoryStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  limit: number; // Max requests
  window: number; // Time window in seconds
  identifier: string; // Unique identifier (IP, userId, etc.)
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Timestamp when limit resets
}

/**
 * Simple rate limiter using in-memory store
 * For production, replace with Upstash Redis
 */
export async function rateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, window, identifier } = config;
  const now = Date.now();
  const windowMs = window * 1000;
  const key = identifier;

  // Get or create entry
  let entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    // Create new window
    entry = { count: 0, resetAt: now + windowMs };
    memoryStore.set(key, entry);
  }

  // Increment count
  entry.count++;

  const success = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    success,
    limit,
    remaining,
    reset: entry.resetAt,
  };
}

/**
 * Rate limit presets
 */
export const RATE_LIMITS = {
  // Login: 5 attempts per minute
  LOGIN: { limit: 5, window: 60 },

  // Register: 3 attempts per minute
  REGISTER: { limit: 3, window: 60 },

  // Public tracking: 20 requests per minute
  TRACKING_PUBLIC: { limit: 20, window: 60 },

  // Premium tracking: 100 requests per minute
  TRACKING_PREMIUM: { limit: 100, window: 60 },

  // API Free tier: 100 requests per day
  API_FREE: { limit: 100, window: 86400 },

  // API Basic: 1000 requests per day
  API_BASIC: { limit: 1000, window: 86400 },

  // API Pro: 10000 requests per day
  API_PRO: { limit: 10000, window: 86400 },

  // Password reset: 3 per hour
  PASSWORD_RESET: { limit: 3, window: 3600 },

  // General API: 60 requests per minute
  GENERAL: { limit: 60, window: 60 },
};

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * Create rate limit key
 */
export function createRateLimitKey(prefix: string, identifier: string): string {
  return `ratelimit:${prefix}:${identifier}`;
}

/**
 * Rate limit with Upstash (for production)
 * Install: npm install @upstash/ratelimit @upstash/redis
 */

// Uncomment for Upstash production usage:
/*
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const upstashLimiters = {
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:login',
  }),
  
  tracking: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: 'ratelimit:tracking',
  }),
  
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 d'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),
};
*/

export default rateLimit;
