import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * Sanitizes a string by removing dangerous HTML tags.
 * Use this for any User Generated Content (UGC) before display or storage.
 */
export function sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'], // Allow basic formatting
        ALLOWED_ATTR: ['href']
    });
}

/**
 * Common Zod Schemas for API Input
 */
export const CommonSchemas = {
    // Email Validation
    email: z.string().email(),

    // Phone (start with 62 or 08)
    phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, 'Invalid Format'),

    // Positive Amount (Money)
    amount: z.number().positive(),

    // Safe String (Sanitized transform)
    safeString: z.string().transform(str => sanitizeInput(str)),

    // UUID
    uuid: z.string().uuid()
};

/**
 * Example Usage in API Route:
 * 
 * const body = await req.json();
 * const result = z.object({
 *   email: CommonSchemas.email,
 *   amount: CommonSchemas.amount,
 *   bio: CommonSchemas.safeString
 * }).safeParse(body);
 * 
 * if (!result.success) return NextResponse.json(result.error, { status: 400 });
 */
