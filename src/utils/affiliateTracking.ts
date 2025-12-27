/**
 * AFFILIATE TRACKING UTILITIES
 * Phase 311-315: Cookie management and tracking helpers
 */

import { cookies } from 'next/headers';

export const AFFILIATE_COOKIE_NAME = 'cekkirim_ref';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Get affiliate code from cookies
 */
export async function getAffiliateCode(): Promise<string | null> {
    const cookieStore = await cookies();
    const refCookie = cookieStore.get(AFFILIATE_COOKIE_NAME);
    return refCookie?.value || null;
}

/**
 * Set affiliate code in cookies
 */
export async function setAffiliateCode(code: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(AFFILIATE_COOKIE_NAME, code, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

/**
 * Clear affiliate cookie
 */
export async function clearAffiliateCode(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(AFFILIATE_COOKIE_NAME);
}

/**
 * Generate affiliate link for a product
 */
export function generateAffiliateLink(
    productPath: string,
    affiliateCode: string,
    baseUrl?: string
): string {
    const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://cekkirim.com';
    const url = new URL(productPath, base);
    url.searchParams.set('ref', affiliateCode);
    return url.toString();
}

/**
 * Parse affiliate code from URL
 */
export function parseAffiliateCode(url: string): string | null {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('ref');
    } catch {
        return null;
    }
}

/**
 * Calculate commission amount
 */
export function calculateCommission(
    amount: number,
    rate: number
): number {
    return Math.round((amount * rate / 100) * 100) / 100; // Round to 2 decimals
}

/**
 * Format commission rate for display
 */
export function formatCommissionRate(rate: number): string {
    return `${rate}%`;
}
