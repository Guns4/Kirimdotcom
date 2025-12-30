import { createClient } from '@/utils/supabase/server'; // Or your admin client
import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface AuthResult {
    success: boolean;
    user_id?: string;
    error?: string;
    code?: number;
    remaining_balance?: number;
}

/**
 * Authenticates API Request, Checks Balance, and Deducts Cost.
 * Usage: const auth = await authenticateApi(req, 50); // Charge 50 IDR
 */
export async function authenticateApi(req: NextRequest, cost: number = 0): Promise<AuthResult> {
    const authHeader = req.headers.get('Authorization');
    
    // 1. Check Format
    if (!authHeader || !authHeader.startsWith('Bearer sk_live_')) {
        return { success: false, error: 'Missing or Invalid Authorization Header format (Bearer sk_live_...)', code: 401 };
    }

    const rawKey = authHeader.replace('Bearer ', '');
    
    // 2. Hash Key
    const hash = createHash('sha256').update(rawKey).digest('hex');
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = req.nextUrl.pathname;

    // 3. Call Atomic Database Function
    // Note: We use a service role client or ensure the function allows public access if properly secured.
    // Assuming standard client for now, but usually Rpc requires proper setup.
    // If using 'supabase-js', ensure you have a client that can call this RPC.
    
    // WARNING: In Next.js route handlers, creating a client with cookies() might not work 
    // for external API calls that carry no session cookies. 
    // You likely need an internal SERVICE_ROLE client for checking API keys from external sources.
    // FOR SAFETY: We will assume you have a 'createAdminClient' or similar. 
    // If not, we use createClient() but it might treat it as anon.
    // The SQL function is SECURITY DEFINER, so anon can optimize it if we allow it or use a service key.
    
    const supabase = createClient(cookies()); // Replace with admin client if needed for external calls

    const { data, error } = await supabase.rpc('charge_api_usage', {
        p_key_hash: hash,
        p_cost: cost,
        p_endpoint: endpoint,
        p_ip_address: ip
    });

    if (error) {
        console.error('API Charge Error:', error);
        return { success: false, error: 'Internal System Error', code: 500 };
    }

    // RPC returns JSON
    const result = data as AuthResult; // Typing might need adjustment based on RPC return structure
    
    // Map code if missing (Function returns code in JSON)
    if (!result.success && !result.code) result.code = 403;

    return result;
}

export function apiError(message: string, status: number) {
    return NextResponse.json(
        { success: false, error: { message, code: 'api_error' } },
        { status }
    );
}
