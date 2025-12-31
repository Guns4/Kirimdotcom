import { NextResponse } from 'next/server';
import { ShippingCacheManager } from '@/lib/shipping-cache';

export async function POST(request: Request) {
    try {
        const { origin, destination, weight, courier } = await request.json();

        if (!origin || !destination || !weight || !courier) {
            return NextResponse.json(
                { error: 'Missing required fields: origin, destination, weight, courier' },
                { status: 400 }
            );
        }

        // Step 1: Check Cache First (SAVE MONEY!)
        const cached = await ShippingCacheManager.getCache({
            origin,
            destination,
            weight: parseInt(weight),
            courier,
        });

        if (cached) {
            console.log(`[COST API] Cache HIT! Saved API call for ${courier}`);
            return NextResponse.json({
                source: 'cache',
                cached_at: cached.created_at,
                data: {
                    courier: cached.courier,
                    service: cached.service,
                    price: parseFloat(cached.price.toString()) + 1000, // Markup +1000
                    etd: cached.etd,
                    original_price: parseFloat(cached.price.toString()),
                },
            });
        }

        // Step 2: Cache MISS - Fetch from Vendor API
        console.log(`[COST API] Cache MISS. Calling vendor API for ${courier}...`);

        // Mock vendor API response (replace with real RajaOngkir/Binderbyte API)
        const mockPrice = 15000 + parseInt(weight) * 5000; // 15k base + 5k/kg
        const service = 'REG';
        const etd = '2-3 Days';

        // Step 3: Store in Cache for next time
        await ShippingCacheManager.setCache(
            {
                origin,
                destination,
                weight: parseInt(weight),
                courier,
                service,
                price: mockPrice,
                etd,
            },
            {
                // Store full vendor response for debugging
                vendor: 'mock',
                timestamp: new Date().toISOString(),
                query: { origin, destination, weight, courier },
            }
        );

        // Step 4: Return with markup
        return NextResponse.json({
            source: 'api',
            fetched_at: new Date().toISOString(),
            data: {
                courier,
                service,
                price: mockPrice + 1000, // Markup +1000
                etd,
                original_price: mockPrice,
            },
            cache_info: 'Result cached for 7 days',
        });
    } catch (error) {
        console.error('Shipping cost API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint for cache statistics
export async function GET() {
    try {
        const stats = await ShippingCacheManager.getCacheStats();

        return NextResponse.json({
            cache_statistics: {
                total_cached_routes: stats.total_entries,
                total_api_calls_saved: stats.total_hits,
                expired_entries: stats.expired_entries,
                estimated_cost_savings: `Rp ${stats.cache_savings.toLocaleString('id-ID')}`,
                savings_usd: `$${(stats.cache_savings / 15000).toFixed(2)}`,
            },
            message:
                stats.total_hits > 0
                    ? `Cache saved you ${stats.total_hits} API calls! 🎉`
                    : 'No cache hits yet. Keep using the app!',
        });
    } catch (error) {
        console.error('Cache stats error:', error);
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
