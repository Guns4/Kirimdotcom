import { z } from 'zod';

// Input validation schema
export const ShippingRequestSchema = z.object({
    origin_city: z.string().min(1).max(100),
    destination_district: z.string().min(1).max(100),
    weight: z.number().positive().max(100000) // Max 100kg
});

// Rate limiting simulation (in production, use Redis/Upstash)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
    const now = Date.now();
    const windowMs = 10000; // 10 seconds
    const maxRequests = 10;

    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetAt) {
        rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
    }

    if (record.count >= maxRequests) {
        return {
            allowed: false,
            error: 'Too Many Requests. Please wait 10 seconds.'
        };
    }

    record.count++;
    return { allowed: true };
}

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitStore.entries()) {
        if (now > record.resetAt) {
            rateLimitStore.delete(ip);
        }
    }
}, 60000); // Clean every minute
