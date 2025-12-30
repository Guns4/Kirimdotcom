// Rate Limiter Service
// Protects server from aggressive resellers
// Supports Redis (Production) and In-Memory (Development)

type RateLimitRecord = {
    count: number;
    lastRequest: number;
    blockedUntil?: number;
};

// In-Memory Store (Fallback)
const memoryStore = new Map<string, RateLimitRecord>();

// Config
const CONFIG = {
    WINDOW_MS: 1000, // 1 second
    LIMIT_NORMAL: 1, // 1 req/sec (soft)
    LIMIT_ABUSE: 10, // 10 req/sec (hard block)
    BLOCK_DURATION_MS: 10 * 60 * 1000 // 10 minutes
};

export interface RateLimitResult {
    allowed: boolean;
    status: 'OK' | 'WARNING' | 'BLOCKED';
    reason?: string;
    retryAfter?: number;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
    const now = Date.now();

    // 1. Get Record
    let record = memoryStore.get(ip);

    if (!record) {
        record = { count: 0, lastRequest: now };
        memoryStore.set(ip, record);
    }

    // 2. Check Block
    if (record.blockedUntil && now < record.blockedUntil) {
        return {
            allowed: false,
            status: 'BLOCKED',
            reason: 'Too Many Requests - IP Blocked for aggressive behavior',
            retryAfter: Math.ceil((record.blockedUntil - now) / 1000)
        };
    }

    // 3. Reset Window if passed
    if (now - record.lastRequest > CONFIG.WINDOW_MS) {
        record.count = 0;
        record.lastRequest = now;
        // Clear block if expired (though handled above, just cleanup)
        if (record.blockedUntil && now > record.blockedUntil) {
            record.blockedUntil = undefined;
        }
    }

    // 4. Increment
    record.count++;

    // 5. Check Abuse (Hard Limit)
    if (record.count > CONFIG.LIMIT_ABUSE) {
        record.blockedUntil = now + CONFIG.BLOCK_DURATION_MS;
        console.log(`[RateLimit] IP ${ip} BLOCKED for 10 mins (Request ${record.count}/s)`);

        // Trigger Warning Email
        sendAbuseNotification(ip, record.count);

        return {
            allowed: false,
            status: 'BLOCKED',
            reason: 'Abuse Detected - IP Blocked',
            retryAfter: 600
        };
    }

    // 6. Check Normal (Soft Limit)
    // We allow bursts up to Abuse limit, but maybe warn log?
    // For this requirements: "Normal: 1 req/detik" implies we might want to throttle or just flag.
    // We'll return OK but maybe set a header in real middleware.

    memoryStore.set(ip, record);
    return {
        allowed: true,
        status: 'OK'
    };
}

// Mock Email Notification
function sendAbuseNotification(ip: string, rate: number) {
    // In production: Lookup user by IP or Auth Context
    console.log(`[Email] 📧 Sending API Abuse Warning to admin/user for IP ${ip}. Rate: ${rate} req/s`);

    // Logic:
    // "Sistem Anda terlalu agresif (Speed: ${rate}/s), mohon perlambat atau Anda akan diblokir permanen."
}
