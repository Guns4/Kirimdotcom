import { NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@/utils/supabase/server';

const MARKUP_AMOUNT = 1000; // Rp 1.000 Profit per shipment check (or per selection)

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { origin, destination, weight, courier = 'jne' } = body;

        if (!origin || !destination || !weight) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. CACHE CHECK (Supabase)
        // Check if we have this exact query cached in recent time
        // (Simplified caching logic for demonstration)
        const cacheKey = `${origin}-${destination}-${weight}-${courier}`;
        const { data: cached } = await supabase
            .from('shipping_cache') // Assuming a table for caching
            .select('*')
            .eq('key', cacheKey)
            .gt('created_at', new Date(Date.now() - 3600 * 1000).toISOString()) // 1 hour cache
            .single();

        if (cached) {
            console.log('⚡ CACHE HIT');
            return NextResponse.json(cached.data);
        }

        // 2. FETCH VENDOR (Binderbyte Version)
        console.log('🔌 CACHE MISS: Fetching Binderbyte...');

        // Binderbyte butuh params: origin, destination, weight, courier
        // Catatan: Pastikan kode kota (origin/destination) sesuai standar Binderbyte
        const response = await axios.get(
            `https://api.binderbyte.com/v1/cost`,
            {
                params: {
                    api_key: process.env.BINDERBYTE_API_KEY,
                    courier: courier,
                    origin: origin, // Binderbyte pakai kode kota/kecamatan string
                    destination: destination,
                    weight: weight // dalam gram
                }
            }
        );

        // Struktur response Binderbyte berbeda dengan RajaOngkir
        const rawData = response.data.data;

        // Data mapping: Binderbyte return { service: "REG", price: 10000, etd: "1-2 days" }

        // 3. MARKUP PROFIT
        const processedCosts = rawData.costs.map((service: any) => {
            // Binderbyte biasanya return 'price' atau 'cost'
            const originalCost = parseInt(service.price);
            const markupCost = originalCost + MARKUP_AMOUNT;

            return {
                service: service.service,
                description: service.description,
                cost: [{ value: markupCost, etd: service.etd, note: 'Termasuk Biaya Layanan' }]
            };
        });

        const finalData = {
            origin_details: rawData.origin,
            destination_details: rawData.destination,
            results: [{ code: courier, costs: processedCosts }] // Format disamakan biar frontend gak bingung
        };

        // 4. SAVE TO CACHE
        await supabase.from('shipping_cache').upsert({
            key: cacheKey,
            data: finalData,
            created_at: new Date().toISOString()
        }, { onConflict: 'key' });

        return NextResponse.json(finalData);

    } catch (error: any) {
        console.error('[SHIPPING API ERROR]', error.response?.data || error.message);
        return NextResponse.json({
            error: 'Failed to fetch shipping costs',
            details: error.response?.data?.message || error.message
        }, { status: 500 });
    }
}
