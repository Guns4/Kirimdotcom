export function checkDomainWhitelist(
    referer: string | null,
    origin: string | null,
    allowedDomains: string[]
): { allowed: boolean; error?: string } {

    // Development mode: no domains configured yet
    if (!allowedDomains || allowedDomains.length === 0) {
        return { allowed: true };
    }

    // Extract domain from referer or origin
    const requestDomain = extractDomain(referer || origin || '');

    if (!requestDomain) {
        return {
            allowed: false,
            error: 'Unable to verify request origin. Please ensure your website sends proper Referer or Origin headers.'
        };
    }

    // Check if domain is in whitelist
    const isAllowed = allowedDomains.some(allowed => {
        // Support wildcard subdomains: *.example.com
        if (allowed.startsWith('*.')) {
            const baseDomain = allowed.substring(2);
            return requestDomain.endsWith(baseDomain);
        }
        return requestDomain === allowed || requestDomain === `www.${allowed}`;
    });

    if (!isAllowed) {
        return {
            allowed: false,
            error: `Domain not authorized. Allowed domains: ${allowedDomains.join(', ')}`
        };
    }

    return { allowed: true };
}

function extractDomain(url: string): string | null {
    try {
        // Handle both full URLs and just domains
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        const urlObj = new URL(url);
        return urlObj.hostname.toLowerCase();
    } catch {
        return null;
    }
}
