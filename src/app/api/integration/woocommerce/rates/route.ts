import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkCache, setCache } from '@/lib/shipping/cache-engine';
import { checkAndDeductBalance } from '@/lib/billing/metering';
import { ShippingRequestSchema, checkRateLimit } from '@/lib/security/api-guards';

// Mock function for rate retrieval (replace with actual logic)
async function getCouriersRates(origin: string, destination: string, weight: number) {
    return [
        { courier: 'JNE', service: 'REG', price: 10000, etd: '2-3 Days' },
        { courier: 'SiCepat', service: 'HALU', price: 8000, etd: '3-4 Days' },
        { courier: 'J&T', service: 'EZ', price: 12000, etd: '1-2 Days' }
    ];
}

export async function POST(request: Request) {
    try {
        // 1. Rate Limiting Check
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimitResult = checkRateLimit(ip);

        if (!rateLimitResult.allowed) {
            return NextResponse.json({ error: rateLimitResult.error }, { status: 429 });
        }

        // 2. API Key Validation
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key Required' }, { status: 401 });
        }

        const supabase = createClient();

        // 1. Validate API Key & Check Balance
        // Assuming we have an 'api_keys' table linked to users, or checking user profile directly if key is stored there
        // For MVP, letting apiKey be the user_id or a specific key column

        // Simplified: Check user by ID if apiKey is ID, or lookup key
        // Here assuming apiKey maps to a user_id via a lookup
        const { data: userKeyData, error: keyError } = await supabase
            .from('plugin_licenses') // Reusing license table or dedicated api_keys table
            .select('user_id')
            .eq('license_key', apiKey)
            .single();

        if (keyError || !userKeyData) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
        }

        const userId = userKeyData.user_id;

        // Check Balance
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'User Not Found' }, { status: 404 });
        }

        if (userData.balance < 500) {
            return NextResponse.json({ error: 'Insufficient Balance. Please Topup.' }, { status: 402 });
        }

        // 2. Deduct Balance (Cost per request)
        const COST_PER_REQUEST = 50;
        await supabase.rpc('decrement_balance', { user_id: userId, amount: COST_PER_REQUEST });

        // 3. Calculate Rates with Caching
        const body = await request.json();
        const { origin_city, destination_district, weight } = body;

        // Check Cache First
        const cachedRates = await checkCache({
            origin: origin_city,
            destination: destination_district,
            weight: weight
        });

        let rawRates;
        if (cachedRates && cachedRates.length > 0) {
            console.log('✅ Cache Hit - Using cached rates');
            rawRates = cachedRates;
        } else {
            console.log('❌ Cache Miss - Fetching from vendor');
            rawRates = await getCouriersRates(origin_city, destination_district, weight);

            // Save to Cache
            await setCache({
                origin: origin_city,
                destination: destination_district,
                weight: weight
            }, rawRates);
        }

        // 4. Profit Injection (Markup)
        const MARKUP = 1000;
        const finalRates = rawRates.map(rate => ({
            id: `${rate.courier.toLowerCase()}_${rate.service.toLowerCase()}`,
            label: `${rate.courier} ${rate.service} (via CekKirim)`,
            cost: rate.price + MARKUP, // Silent profit
            meta_data: {
                etd: rate.etd
            }
        }));

        return NextResponse.json({
            success: true,
            rates: finalRates
        });

    } catch (e: any) {
        console.error("WooCommerce Rate Error:", e);
        return NextResponse.json({ error: 'Server Error', details: e.message }, { status: 500 });
    }
}
