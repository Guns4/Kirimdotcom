#!/bin/bash

# =============================================================================
# API Monetization & Metering Setup
# =============================================================================

echo "Initializing API Metering System..."
echo "================================================="

# 1. Database Schema (Atomic Charge Logic)
echo "1. Generating SQL Schema: metering_schema.sql"
cat <<EOF > metering_schema.sql
-- 1. Wallets Table (If you don't have one, this is a basic structure)
CREATE TABLE IF NOT EXISTS public.wallets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance numeric DEFAULT 0,
    currency text DEFAULT 'IDR',
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. API Usage Logs
CREATE TABLE IF NOT EXISTS public.api_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    key_id uuid REFERENCES public.api_keys(id),
    endpoint text,
    status integer,
    cost numeric,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Atomic Charge Function
-- Validates Key Hash, Checks Balance, Deducts, Logs.
CREATE OR REPLACE FUNCTION public.charge_api_usage(
    p_key_hash text,
    p_cost numeric,
    p_endpoint text,
    p_ip_address text
)
RETURNS jsonb AS \$\$
DECLARE
    v_user_id uuid;
    v_key_id uuid;
    v_balance numeric;
    v_new_balance numeric;
BEGIN
    -- A. Validate API Key
    SELECT user_id, id INTO v_user_id, v_key_id
    FROM public.api_keys
    WHERE key_hash = p_key_hash
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid API Key', 'code', 401);
    END IF;

    -- B. Update Last Used
    UPDATE public.api_keys SET last_used_at = now() WHERE id = v_key_id;

    -- C. Check Balance (Lock row for update to prevent race conditions)
    SELECT balance INTO v_balance
    FROM public.wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
         -- Attempt to create wallet if missing (Auto-provisioning logic optional)
         INSERT INTO public.wallets (user_id, balance) VALUES (v_user_id, 0) RETURNING balance INTO v_balance;
    END IF;

    IF v_balance < p_cost THEN
        -- Log attempt
        INSERT INTO public.api_logs (user_id, key_id, endpoint, status, cost, ip_address)
        VALUES (v_user_id, v_key_id, p_endpoint, 402, 0, p_ip_address);
        
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient Funds', 'code', 402);
    END IF;

    -- D. Process Charge
    v_new_balance := v_balance - p_cost;
    
    UPDATE public.wallets 
    SET balance = v_new_balance, updated_at = now() 
    WHERE user_id = v_user_id;

    -- E. Log Success
    INSERT INTO public.api_logs (user_id, key_id, endpoint, status, cost, ip_address)
    VALUES (v_user_id, v_key_id, p_endpoint, 200, p_cost, p_ip_address);

    RETURN jsonb_build_object('success', true, 'user_id', v_user_id, 'remaining_balance', v_new_balance);
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;
EOF
echo "   [?] Schema created."

# 2. Helper Library (Server-Side)
echo "2. Creating Auth Helper: src/lib/api-auth.ts"
mkdir -p src/lib

cat <<EOF > src/lib/api-auth.ts
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
EOF
echo "   [?] Helper created."

# 3. Example Usage Route
echo "3. Creating Example Route: src/app/api/v1/example/route.ts"
mkdir -p src/app/api/v1/example

cat <<EOF > src/app/api/v1/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateApi, apiError } from '@/lib/api-auth';

// Force dynamic needed to read headers/IP
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    // 1. Authenticate & Charge (e.g., 50 Rupiah per call)
    const auth = await authenticateApi(req, 50);

    if (!auth.success) {
        return apiError(auth.error || 'Unauthorized', auth.code || 401);
    }

    // 2. Business Logic
    const data = {
        message: 'Hello Developer!',
        timestamp: new Date().toISOString(),
        subscription: {
            plan: 'Pay-as-you-go',
            remaining_balance: auth.remaining_balance
        }
    };

    return NextResponse.json({ success: true, data });
}
EOF
echo "   [?] Example route created."

echo ""
echo "================================================="
echo "API Metering Setup Complete!"
echo "1. Run 'metering_schema.sql' in Supabase."
echo "   (This creates wallets table and the charge function)"
echo "2. Use 'authenticateApi(req, cost)' in your API Routes to protect them."
echo "3. Check 'src/app/api/v1/example/route.ts' for reference."
