import { NextResponse } from 'next/server';
import { binderbyteClient, handleApiError, BinderbyteError } from '@/lib/api/binderbyte';
import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role (for cache writes)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LocationResult {
    code: string;
    name: string;
    province?: string;
    city?: string;
    district?: string;
    type?: string;
    full_name?: string;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '10');

        // 1. Validate Query
        if (!query) {
            return NextResponse.json({
                results: [],
                source: 'none',
                message: 'Query parameter "q" is required',
            });
        }

        if (query.length < 3) {
            return NextResponse.json({
                results: [],
                source: 'none',
                message: 'Query must be at least 3 characters',
            });
        }

        // 2. CHECK DATABASE CACHE FIRST (Free & Fast!)
        console.log(`[Location Search] Searching cache for: "${query}"`);

        const { data: cachedData, error: cacheError } = await supabase
            .rpc('search_locations', {
                search_query: query,
                result_limit: limit,
            });

        if (!cacheError && cachedData && cachedData.length > 0) {
            console.log(`[Location Search] ✅ CACHE HIT! Found ${cachedData.length} results`);

            return NextResponse.json({
                results: cachedData.map((item: any) => ({
                    code: item.code,
                    name: item.name,
                    province: item.province,
                    city: item.city,
                    district: item.district,
                    full_name: item.full_name || item.name,
                    similarity_score: item.similarity_score,
                })),
                source: 'cache',
                count: cachedData.length,
                message: 'Results from local database',
            });
        }

        // 3. CACHE MISS - Fetch from Binderbyte API
        console.log(`[Location Search] ⚠️ CACHE MISS - Fetching from Binderbyte...`);

        try {
            // Fetch subdisctrict list from Binderbyte
            const response = await binderbyteClient.get('/list_subdis', {
                params: {
                    search: query,
                },
            });

            // Handle different response structures
            const locations: any[] = response.data?.data || response.data || [];

            if (locations.length === 0) {
                return NextResponse.json({
                    results: [],
                    source: 'vendor',
                    count: 0,
                    message: 'No locations found',
                });
            }

            // 4. Transform and Save to Cache
            console.log(`[Location Search] 📥 Caching ${locations.length} locations...`);

            const inserts: LocationResult[] = locations.map((loc: any) => {
                // Build full name from available data
                const parts = [
                    loc.subdis || loc.subdistrict || loc.name,
                    loc.city,
                    loc.province,
                ].filter(Boolean);

                return {
                    code: loc.subdis_id || loc.code || `loc-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    name: loc.subdis || loc.subdistrict || loc.name,
                    province: loc.province || null,
                    city: loc.city || null,
                    district: loc.district || null,
                    type: 'subdistrict',
                    full_name: parts.join(', '),
                };
            });

            // Upsert to database (insert or update if exists)
            const { error: insertError } = await supabase
                .from('location_cache')
                .upsert(
                    inserts.map(loc => ({
                        code: loc.code,
                        name: loc.name,
                        province: loc.province,
                        city: loc.city,
                        district: loc.district,
                        type: loc.type,
                        full_name: loc.full_name,
                        updated_at: new Date().toISOString(),
                    })),
                    {
                        onConflict: 'code',
                        ignoreDuplicates: false,
                    }
                );

            if (insertError) {
                console.error('[Location Search] Cache insert error:', insertError);
            } else {
                console.log('[Location Search] ✅ Cached successfully for future use');
            }

            // 5. Return fresh data from vendor
            return NextResponse.json({
                results: inserts.slice(0, limit),
                source: 'vendor',
                count: inserts.length,
                message: 'Results from shipping provider (now cached)',
            });

        } catch (vendorError: any) {
            console.error('[Location Search] Vendor API error:', vendorError);

            // If vendor fails, try alternative: simple database search without RPC
            const { data: fallbackData } = await supabase
                .from('location_cache')
                .select('code, name, province, city, district, full_name')
                .or(`name.ilike.%${query}%,city.ilike.%${query}%,province.ilike.%${query}%`)
                .limit(limit);

            if (fallbackData && fallbackData.length > 0) {
                return NextResponse.json({
                    results: fallbackData,
                    source: 'cache_fallback',
                    count: fallbackData.length,
                    message: 'Vendor unavailable, showing cached results',
                });
            }

            // Both vendor and cache failed
            throw handleApiError(vendorError);
        }

    } catch (error: any) {
        console.error('[Location Search] Error:', error);

        if (error instanceof BinderbyteError) {
            return NextResponse.json(
                {
                    error: error.message,
                    statusCode: error.statusCode,
                },
                { status: error.statusCode }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to search locations',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
