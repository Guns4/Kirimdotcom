// Multi-Account Correlation System (The Farming Killer)
// Detects if one IP tries to access multiple API keys

// In-memory store to track IP <-> API Key relationships
// Map<IP_Address, Set<API_Keys>>
const ipKeyMap = new Map<string, Set<string>>();
const bannedIps = new Set<string>();
const suspiciousActivity = new Map<string, { count: number; firstSeen: number }>();

export function checkAccountFarming(ip: string, apiKey: string): { banned: boolean; reason?: string } {
    // 1. Check if IP is permanently banned
    if (bannedIps.has(ip)) {
        console.log(`[FARMING SHIELD] 🚫 Rejected banned IP: ${ip}`);
        return { banned: true, reason: "IP_PERMANENTLY_BANNED" };
    }

    // 2. Get list of keys that this IP has used
    let keysUsed = ipKeyMap.get(ip);
    if (!keysUsed) {
        keysUsed = new Set();
        ipKeyMap.set(ip, keysUsed);
    }

    // 3. Add current key
    keysUsed.add(apiKey);

    // 4. STRICT RULE: Maximum 3 accounts per IP
    // If 1 IP is used for 4+ different accounts → HACKER/FARMING INDICATOR
    const MAX_ACCOUNTS_PER_IP = 3;

    if (keysUsed.size > MAX_ACCOUNTS_PER_IP) {
        bannedIps.add(ip); // Ban the IP
        console.log(`[FARMING SHIELD] 🚨 FARMING DETECTED! IP ${ip} used ${keysUsed.size} different keys. BANNING.`);

        // In production: Trigger database function to auto-suspend all API keys from this IP
        // await supabase.rpc('ban_ip_and_suspend_keys', { ip_address: ip })

        // Log to security audit trail
        logSecurityEvent(ip, 'MULTI_ACCOUNT_ABUSE', keysUsed.size);

        return { banned: true, reason: "MULTI_ACCOUNT_ABUSE" };
    }

    // 5. Warning threshold - Log suspicious activity
    if (keysUsed.size >= 2) {
        console.warn(`[FARMING SHIELD] ⚠️ Warning: IP ${ip} using ${keysUsed.size} different keys`);
        trackSuspiciousActivity(ip);
    }

    return { banned: false };
}

function trackSuspiciousActivity(ip: string) {
    const activity = suspiciousActivity.get(ip) || { count: 0, firstSeen: Date.now() };
    activity.count++;
    suspiciousActivity.set(ip, activity);

    // If suspicious activity persists for 24 hours, escalate to admin
    const hoursSinceFirstSeen = (Date.now() - activity.firstSeen) / (1000 * 60 * 60);
    if (hoursSinceFirstSeen < 24 && activity.count > 5) {
        console.error(`[FARMING SHIELD] 🚨 ESCALATION: IP ${ip} has ${activity.count} suspicious events in ${hoursSinceFirstSeen.toFixed(1)} hours`);
        // In production: Send alert to admin dashboard
    }
}

function logSecurityEvent(ip: string, eventType: string, severity: number) {
    // In production: Log to database for forensic analysis
    console.log(`[SECURITY AUDIT] IP: ${ip}, Event: ${eventType}, Severity: ${severity}, Time: ${new Date().toISOString()}`);
}

// Admin tools
export function getBannedIPs(): string[] {
    return Array.from(bannedIps);
}

export function unbanIP(ip: string): void {
    bannedIps.delete(ip);
    ipKeyMap.delete(ip);
    suspiciousActivity.delete(ip);
    console.log(`[FARMING SHIELD] IP ${ip} has been unbanned by admin`);
}

export function getIPStats(ip: string) {
    return {
        keysUsed: ipKeyMap.get(ip)?.size || 0,
        isBanned: bannedIps.has(ip),
        suspiciousActivity: suspiciousActivity.get(ip),
    };
}
