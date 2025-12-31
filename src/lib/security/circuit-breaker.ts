import { createClient } from '@/utils/supabase/server';

const RATE_LIMIT_PER_MINUTE = 100;
const SUSPENSION_DURATION_MS = 60 * 60 * 1000; // 1 hour

// In-memory tracking (production: use Redis)
const requestTracking = new Map<string, { count: number; resetAt: number }>();

export async function checkCircuitBreaker(userId: string): Promise<{ allowed: boolean; error?: string }> {
    const supabase = await createClient();

    // 1. Check if already suspended
    const { data: license } = await (supabase as any)
        .from('plugin_licenses')
        .select('status, suspended_until, suspension_reason')
        .eq('user_id', userId)
        .single();

    if (license?.status === 'SUSPENDED_TEMPORARY' || license?.status === 'SUSPENDED_PERMANENT') {
        const suspendedUntil = license.suspended_until ? new Date(license.suspended_until) : null;

        if (suspendedUntil && suspendedUntil > new Date()) {
            return {
                allowed: false,
                error: `API suspended until ${suspendedUntil.toISOString()}. Reason: ${license.suspension_reason}`
            };
        } else if (license.status === 'SUSPENDED_TEMPORARY') {
            // Auto-unsuspend if time expired
            await (supabase as any)
                .from('plugin_licenses')
                .update({ status: 'ACTIVE', suspended_until: null, suspension_reason: null })
                .eq('user_id', userId);
        }
    }

    // 2. Track current request
    const now = Date.now();
    const windowMs = 60000; // 1 minute

    const record = requestTracking.get(userId);

    if (!record || now > record.resetAt) {
        requestTracking.set(userId, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
    }

    record.count++;

    // 3. Check threshold
    if (record.count > RATE_LIMIT_PER_MINUTE) {
        // TRIGGER CIRCUIT BREAKER
        const suspendedUntil = new Date(now + SUSPENSION_DURATION_MS);

        await (supabase as any)
            .from('plugin_licenses')
            .update({
                status: 'SUSPENDED_TEMPORARY',
                suspended_until: suspendedUntil.toISOString(),
                suspension_reason: `Abnormal traffic detected: ${record.count} requests/minute`
            })
            .eq('user_id', userId);

        console.error(`🚨 CIRCUIT BREAKER TRIGGERED for user ${userId}. Suspended until ${suspendedUntil}`);

        // TODO: Send email notification

        return {
            allowed: false,
            error: 'Abnormal traffic detected. API temporarily suspended to protect your account. Please check your integration.'
        };
    }

    return { allowed: true };
}

// Cleanup old tracking records
setInterval(() => {
    const now = Date.now();
    for (const [userId, record] of requestTracking.entries()) {
        if (now > record.resetAt) {
            requestTracking.delete(userId);
        }
    }
}, 60000);
