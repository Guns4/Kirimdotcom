import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// GET /api/marketplace/products
// Public product catalog
// ==========================================

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');        // PHYSICAL / DIGITAL_SMM / DIGITAL_FILE
        const category = searchParams.get('category'); // PACKING / SMM_INSTAGRAM / SMM_TIKTOK
        const featured = searchParams.get('featured'); // true / false
        const limit = parseInt(searchParams.get('limit') || '50');

        console.log('[Marketplace Products] Fetching products...', { type, category, featured, limit });

        // Build query
        let query = supabase
            .from('marketplace_products')
            .select('id, sku, name, description, type, category, price_sell, stock, image_url, is_featured')
            .eq('is_active', true);

        // Apply filters
        if (type) {
            query = query.eq('type', type);
        }

        if (category) {
            query = query.eq('category', category);
        }

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        query = query.limit(limit).order('is_featured', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('[Marketplace Products] Error:', error);
            throw error;
        }

        console.log(`[Marketplace Products] Found ${data?.length || 0} products`);

        return NextResponse.json({
            success: true,
            products: data || [],
            count: data?.length || 0,
        });

    } catch (error: any) {
        console.error('[Marketplace Products] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch products',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
