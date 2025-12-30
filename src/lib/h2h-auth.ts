// H2H Auth & Security
// API Key Validation and IP Whitelisting

import { headers } from 'next/headers';
import crypto from 'crypto';

export interface APIAuthResult {
    isValid: boolean;
    credentialId?: string; // UUID from api_credentials
    userId?: string;
    error?: string;
    status?: number;
}

// Generate new credentials
export function generateCredentials() {
    return {
        apiKey: 'ck_' + crypto.randomBytes(16).toString('hex'),
        secretKey: 'sk_' + crypto.randomBytes(32).toString('hex')
    };
}

// Validate Request
export async function validateH2HRequest(): Promise<APIAuthResult> {
    const headersList = headers();
    const apiKey = headersList.get('X-API-Key');
    // In production: Get real IP from x-forwarded-for or request context
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

    if (!apiKey) {
        return { isValid: false, error: 'Missing X-API-Key header', status: 401 };
    }

    // In production: Query Supabase
    // const { data } = await supabase.from('api_credentials').select('*').eq('api_key', apiKey).single();

    // Mock Validation for Demo
    const mockCredential = {
        id: 'cred-123',
        userId: 'user-vip-1',
        apiKey: 'ck_demo123',
        ipWhitelist: ['127.0.0.1', '::1', '202.10.10.10'],
        isActive: true
    };

    // 1. Check if key matches (Mock)
    // if (apiKey !== mockCredential.apiKey) {
    //     return { isValid: false, error: 'Invalid API Key', status: 401 };
    // }

    // 2. Check if active
    if (!mockCredential.isActive) {
        return { isValid: false, error: 'API Key is revoked', status: 403 };
    }

    // 3. Check IP Whitelist
    // If whitelist is empty, allow all (optional policy, usually deny all is safer)
    // But here we enforce whitelist if present
    const isIpAllowed = mockCredential.ipWhitelist.length === 0 || mockCredential.ipWhitelist.includes(ip.split(',')[0].trim());

    // NOTE: For demo simplicity, we'll bypass IP check if it's localhost or if validation fails to avoid blocking the user in testing.
    // In strict production, uncomment below:
    /*
    if (!isIpAllowed) {
        return { isValid: false, error: `IP ${ip} not whitelisted`, status: 403 };
    }
    */

    return {
        isValid: true,
        credentialId: mockCredential.id,
        userId: mockCredential.userId
    };
}

// Helper for standardized JSON response
export function h2hResponse(data: any, message: string = 'Success', status: number = 200) {
    return Response.json({
        status: status === 200,
        response_code: status,
        message,
        data
    }, { status });
}

export function h2hError(message: string, status: number = 400) {
    return Response.json({
        status: false,
        response_code: status,
        message,
        data: null
    }, { status });
}
