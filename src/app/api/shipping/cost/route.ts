import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { origin, destination, weight, courier } = await request.json();

        if (!origin || !destination || !weight || !courier) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);

        // 1. Check Cache
        const { data: cacheData, error: cacheError } = await supabase
            .from('shipping_cache')
            .select('*')
            .eq('origin_code', origin)
            .eq('destination_code', destination)
            .eq('weight_kg', weight)
            .eq('courier', courier)
            .single();

        if (cacheData && !cacheError) {
            // Cache Hit
            return NextResponse.json({
                source: 'cache',
                data: {
                    ...cacheData,
                    price: Number(cacheData.price) + 1000 // Ensure markup is applied
                }
            });
        }

        // 2. Cache Miss: Fetch from Provider (RajaOngkir/Binderbyte)

        // Mocking response for demonstration
        const mockPrice = 15000 + (weight * 5000); // 15k base + 5k/kg
        const serviceName = 'REG';
        const etd = '2-3 Days';

        // 3. Insert specific result to Cache
        const { error: insertError } = await supabase.from('shipping_cache').insert({
            origin_code: origin,
            destination_code: destination,
            weight_kg: weight,
            courier: courier,
            service: serviceName,
            price: mockPrice, // Storing query result (COST)
            etd: etd
        });

        if (insertError) {
            console.error('Failed to cache shipping cost:', insertError);
        }

        // 4. Return with Markup
        return NextResponse.json({
            source: 'api',
            data: {
                origin_code: origin,
                destination_code: destination,
                weight_kg: weight,
                courier: courier,
                service: serviceName,
                price: mockPrice + 1000, // Markup +1000
                etd: etd
            }
        });

    } catch (error) {
        console.error('Shipping Cost Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
