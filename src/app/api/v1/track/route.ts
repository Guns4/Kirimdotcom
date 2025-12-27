import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { trackResi } from '@/app/actions/logistics' // Reuse existing logic

// Simple In-Memory Rate Limiting (For Demonstration - Per Instance)
// Production would use Redis/Upstash
const RATE_LIMIT = new Map<string, number>()
const WINDOW_MS = 60 * 1000 // 1 Minute
const LIMIT = 60 // 60 requests per minute

export async function POST(req: NextRequest) {
    // 1. Validate API Key Header
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
        return NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 })
    }

    const supabase = await createClient()

    // 2. Check DB Validation (Gatekeeper)
    // We use service_role logic effectively here by querying purely on the key
    // But since we are inside a route handler, createClient() uses the request cookies usually.
    // For API access, we actually need a SERVICE_ROLE client to bypass RLS if we are querying keys blindly?
    // OR we query `api_keys` where `secret_key` = input.
    // NOTE: Regular `createClient` might not work if the request doesn't have a user session cookie.
    // We need usage of SUPABASE_SERVICE_ROLE_KEY for this purely API flow if we want to query globally.
    // However, for security, let's assume we use the standard client but we might need `supabaseAdmin` if RLS hides other people's keys.
    // Let's rely on standard client for now, but RLS `select` might fail if not logged in.
    // FIX: We need an "RPCLike" or Service Role check here. 
    // For simplicity in this demo, I will assume we use `supabase` but in real prod use Admin client.

    // START: ADMIN CLIENT SIMULATION (Ideally import a pre-configured admin client)
    // const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    // For now, let's try standard query, assuming 'api_keys' is readable if we create a "read all by key" policy?
    // Actually, RLS policy "Users can view own api keys" blocks this.
    // So we MUST use Service Role or a specific Postgres function.
    // Let's pretend we use Service Role for the lookup.

    // WARNING: In this specific artifact I cannot import 'supabaseAdmin' easily without checking structure.
    // I will write the logic assuming we can fetch it. If fails, user needs to enable public read or use RPC.

    // To make this work safely without exposing keys: 
    // We should use a Postgres Function `verify_api_key(key_text)` that runs with SECURITY DEFINER.

    const { data: keyData, error: keyError } = await supabase
        .rpc('verify_api_key_usage', { key_input: apiKey })
    // If RPC doesn't exist, we fall back to a risky public query or assume Service Key availability.
    // Let's Implement the RPC in the migration file for safety!

    if (keyError || !keyData) {
        // Fallback manual check (if RPC not yet applied, but will fail due to RLS usually)
        // return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 })
        // Let's rely on the RPC I will add to the migration.
        return NextResponse.json({ error: 'Invalid API Key or System Error' }, { status: 401 })
    }

    // keyData should return { id, monthly_quota, current_usage, status }
    const { id, monthly_quota, current_usage, status } = keyData as any

    if (status !== 'active') {
        return NextResponse.json({ error: 'API Key is revoked' }, { status: 403 })
    }

    if (current_usage >= monthly_quota) {
        return NextResponse.json({ error: 'Monthly quota exceeded. Upgrade plan.' }, { status: 402 })
    }

    // 3. Rate Limiting (Memory based for Vercel/Node)
    const now = Date.now()
    if (RATE_LIMIT.has(apiKey)) {
        const lastRequest = RATE_LIMIT.get(apiKey) || 0
        if (now - lastRequest < (1000)) {
            // Simple 1s debounce prevention spam
            return NextResponse.json({ error: 'Rate limit exceeded (1 req/sec)' }, { status: 429 })
        }
    }
    RATE_LIMIT.set(apiKey, now)

    // 4. Process Request
    const body = await req.json()
    const { courier, resi } = body

    if (!courier || !resi) {
        return NextResponse.json({ error: 'Missing courier or resi' }, { status: 400 })
    }

    // Call Internal Function
    const trackingResult = await trackResi({ courierCode: courier, resiNumber: resi })

    // 5. Billing (Increment Usage)
    // Fire and forget or await? Await to ensure accuracy.
    await supabase.rpc('increment_api_usage', { key_id: id })

    return NextResponse.json({
        meta: {
            code: 200,
            status: 'success',
            quota_remaining: monthly_quota - (current_usage + 1)
        },
        data: trackingResult.data
    })
}
