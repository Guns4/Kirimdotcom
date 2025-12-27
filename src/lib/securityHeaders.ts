/**
 * Security Headers Documentation
 * CekKirim.com - Enhanced Browser Security
 */

export const SECURITY_HEADERS = {
    /**
     * X-Frame-Options: DENY
     * Prevents the page from being displayed in an iframe
     * Protects against clickjacking attacks
     */
    'X-Frame-Options': 'DENY',

    /**
     * X-Content-Type-Options: nosniff
     * Prevents browsers from MIME-sniffing
     * Forces browser to use the declared content-type
     */
    'X-Content-Type-Options': 'nosniff',

    /**
     * Strict-Transport-Security
     * Forces HTTPS for 2 years
     * Includes subdomains and preload list
     */
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    /**
     * X-XSS-Protection
     * Legacy XSS filter for older browsers
     * Blocks page if XSS attack is detected
     */
    'X-XSS-Protection': '1; mode=block',

    /**
     * Referrer-Policy
     * Controls how much referrer info is sent
     * origin-when-cross-origin: Full URL for same-origin, origin only for cross-origin
     */
    'Referrer-Policy': 'origin-when-cross-origin',

    /**
     * Permissions-Policy
     * Disables unused browser features
     * Blocks camera, microphone, geolocation, FLoC
     */
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',

    /**
     * Expect-CT
     * Certificate Transparency enforcement
     * Helps detect misissued certificates
     */
    'Expect-CT': 'max-age=86400, enforce',
};

/**
 * Content Security Policy
 * Whitelist of allowed sources
 */
export const CSP_POLICY = {
    // Default fallback
    'default-src': ["'self'"],

    // JavaScript sources
    'script-src': [
        "'self'",
        "'unsafe-eval'",       // Required for Next.js
        "'unsafe-inline'",     // Required for inline scripts
        'https://www.google.com',
        'https://www.gstatic.com',
        'https://challenges.cloudflare.com',
        'https://pagead2.googlesyndication.com',
        'https://partner.googleadservices.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://adservice.google.com',
        'https://tpc.googlesyndication.com',
    ],

    // Stylesheet sources
    'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
    ],

    // Image sources
    'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:',
    ],

    // Font sources
    'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:',
    ],

    // iframe sources (embedded content)
    'frame-src': [
        "'self'",
        'https://challenges.cloudflare.com',
        'https://googleads.g.doubleclick.net',
        'https://www.google.com',
        'https://tpc.googlesyndication.com',
    ],

    // API/Fetch connections
    'connect-src': [
        "'self'",
        'https://onkmywglrpjqulhephkf.supabase.co',
        'https://api.binderbyte.com',
        'https://pagead2.googlesyndication.com',
        'https://www.google-analytics.com',
        'https://region1.google-analytics.com',
    ],

    // Disable plugins
    'object-src': ["'none'"],

    // Base URI restriction
    'base-uri': ["'self'"],

    // Form submission restriction
    'form-action': ["'self'"],

    // Prevent embedding (except widget pages)
    'frame-ancestors': ["'none'"],

    // Upgrade HTTP to HTTPS
    'upgrade-insecure-requests': [],
};

/**
 * Build CSP string from object
 */
export function buildCSPString(policy: Record<string, string[]>): string {
    return Object.entries(policy)
        .map(([key, values]) => {
            if (values.length === 0) return key;
            return `${key} ${values.join(' ')}`;
        })
        .join('; ');
}

/**
 * Security headers for API routes
 */
export const API_SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

export default SECURITY_HEADERS;
