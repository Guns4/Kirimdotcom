# Fintech Architecture: Dynamic Cost Sync & Loss Prevention (PowerShell)

Write-Host "Initializing Dynamic Cost Sync..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. SQL Schema for Products & Providers
Write-Host "1. Generating SQL: cost_sync_schema.sql" -ForegroundColor Yellow
$sqlContent = @'
-- Table to link local products to provider codes
CREATE TABLE IF NOT EXISTS public.provider_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_code TEXT UNIQUE NOT NULL, -- Internal SKU
    provider_code TEXT NOT NULL,       -- e.g. 'P-TELKOMSEL-10'
    provider_name TEXT NOT NULL,       -- 'DIGIFLAZZ' or 'TRIPAY'
    
    cost_price DECIMAL(19,4) NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT TRUE,
    auto_sync BOOLEAN DEFAULT TRUE
);

-- Table for Margin Config
CREATE TABLE IF NOT EXISTS public.product_margins (
    product_code TEXT PRIMARY KEY REFERENCES public.provider_products(product_code),
    fixed_margin DECIMAL(19,4) DEFAULT 500, -- Default margin Rp 500
    min_selling_price DECIMAL(19,4) DEFAULT 0
);
'@
$sqlContent | Set-Content -Path "cost_sync_schema.sql" -Encoding UTF8
Write-Host "   [?] SQL logic generated." -ForegroundColor Green

# 2. API Route for Sync (Cron Job)
Write-Host "2. Creating API Route: src\app\api\cron\sync-prices\route.ts" -ForegroundColor Yellow
$dirApi = "src\app\api\cron\sync-prices"
if (!(Test-Path $dirApi)) { New-Item -ItemType Directory -Force -Path $dirApi | Out-Null }

$apiContent = @'
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
'@
$apiContent | Set-Content -Path "src\app\api\cron\sync-prices\route.ts" -Encoding UTF8
Write-Host "   [?] API route created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Dynamic Cost Sync Configured!" -ForegroundColor Green
Write-Host "1. Run 'cost_sync_schema.sql'." -ForegroundColor White
Write-Host "2. Configure CRON_SECRET in .env." -ForegroundColor Yellow
Write-Host "3. API Endpoint: GET /api/cron/sync-prices" -ForegroundColor White
