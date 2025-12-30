import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Mock Provider Interface
interface ProviderItem {
    buyer_sku_code: string;
    price: number;
    seller_product_status: boolean;
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    const logs: string[] = [];

    try {
        // 1. Fetch from Provider (Mocking Digiflazz logic)
        // In production, replace with fetch('https://api.digiflazz.com/v1/price-list', ...)
        const providerData: ProviderItem[] = [
             { buyer_sku_code: 'PULSA10', price: 10200, seller_product_status: true },
             { buyer_sku_code: 'TOKEN20', price: 20500, seller_product_status: true }
        ];

        // 2. Loop and Update
        for (const item of providerData) {
            // Find local product
            const { data: localProduct } = await supabase
                .from('provider_products')
                .select('*')
                .eq('provider_code', item.buyer_sku_code)
                .single();

            if (!localProduct || !localProduct.auto_sync) continue;

            const oldCost = Number(localProduct.cost_price);
            const newCost = Number(item.price);
            
            // 3. CIRCUIT BREAKER: Check for Anomaly (>10% spike)
            if (oldCost > 0 && newCost > (oldCost * 1.10)) {
                logs.push(`[ALERT] Price Spike for ${item.buyer_sku_code}. Old: ${oldCost}, New: ${newCost}. Disabling product.`);
                
                // Disable Product Safety
                await supabase.from('provider_products')
                    .update({ is_active: false })
                    .eq('id', localProduct.id);
                    
                continue; // Skip price update
            }
            
            // 4. Update Cost
            if (oldCost !== newCost) {
                await supabase.from('provider_products')
                    .update({ 
                        cost_price: newCost,
                        last_synced_at: new Date().toISOString()
                    })
                    .eq('id', localProduct.id);
                
                logs.push(`[UPDATE] ${item.buyer_sku_code}: ${oldCost} -> ${newCost}`);
            }
        }

        return NextResponse.json({ success: true, logs });

    } catch (error: any) {
        console.error('[SYNC_ERROR]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
