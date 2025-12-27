/**
 * Input Sanitization Utilities
 * Clean dangerous characters from user input
 */

/**
 * Remove HTML tags and script injections
 */
export function sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        // Remove script tags and content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove all HTML tags
        .replace(/<[^>]*>/g, '')
        // Decode HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        // Re-encode dangerous characters
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .trim();
}

/**
 * Remove potential SQL injection patterns
 */
export function sanitizeSql(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        // Remove SQL keywords that could be dangerous
        .replace(/(\b)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)(\b)/gi, '')
        // Remove SQL comment syntax
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
        // Remove quotes that could break SQL
        .replace(/['";]/g, '')
        .trim();
}

/**
 * Clean input for safe storage
 * Removes dangerous HTML/JS while preserving text
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Remove javascript: protocol
        .replace(/javascript:/gi, '')
        // Remove data: protocol (except images)
        .replace(/data:(?!image)/gi, '')
        // Encode special characters
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj };

    for (const key in result) {
        const value = result[key];

        if (typeof value === 'string') {
            (result as Record<string, unknown>)[key] = sanitizeInput(value);
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
            (result as Record<string, unknown>)[key] = value.map((item) =>
                typeof item === 'string'
                    ? sanitizeInput(item)
                    : typeof item === 'object'
                        ? sanitizeObject(item as Record<string, unknown>)
                        : item
            );
        }
    }

    return result;
}

/**
 * Clean phone number (keep only digits and leading +)
 */
export function sanitizePhone(phone: string): string {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
}

/**
 * Clean email (lowercase, trim)
 */
export function sanitizeEmail(email: string): string {
    if (!email) return '';
    return email.toLowerCase().trim();
}

/**
 * Clean AWB/Tracking number (alphanumeric only)
 */
export function sanitizeAwb(awb: string): string {
    if (!awb) return '';
    return awb.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
}

/**
 * Clean name (letters, spaces, hyphens only)
 */
export function sanitizeName(name: string): string {
    if (!name) return '';
    return name.replace(/[^a-zA-Z\s'-]/g, '').trim();
}

/**
 * Clean numeric input
 */
export function sanitizeNumber(input: string | number): number {
    if (typeof input === 'number') return input;
    if (!input) return 0;
    return parseFloat(input.replace(/[^0-9.-]/g, '')) || 0;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    try {
        const parsed = new URL(url);
        // Only allow http and https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

/**
 * Rate check for suspicious patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /SELECT.*FROM/i,
        /INSERT.*INTO/i,
        /UPDATE.*SET/i,
        /DELETE.*FROM/i,
        /DROP\s+TABLE/i,
        /UNION\s+SELECT/i,
        /--$/,
        /\/\*.*\*\//,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(input));
}

export default {
    sanitizeHtml,
    sanitizeSql,
    sanitizeInput,
    sanitizeObject,
    sanitizePhone,
    sanitizeEmail,
    sanitizeAwb,
    sanitizeName,
    sanitizeNumber,
    sanitizeUrl,
    containsSuspiciousPatterns,
};
