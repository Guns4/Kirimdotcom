import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// Admin Authentication Helper
// ==========================================

const checkAdmin = (req: Request): boolean => {
    const secret = req.headers.get('x-admin-secret');
    return secret === process.env.ADMIN_SECRET_KEY;
};

// ==========================================
// POST /api/admin/product/manage
// Create or Update Product
// ==========================================

export async function POST(req: Request) {
    try {
        // Security check
        if (!checkAdmin(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const {
            sku,
            name,
            type,
            category,
            category_name,
            price_base,
            price_sell,
            stock,
            description,
            image_url,
            min_order,
            max_order,
            is_active,
            is_featured,
            provider_config,
        } = body;

        // Validation
        if (!sku || !name || !price_sell) {
            return NextResponse.json(
                { error: 'Missing required fields: sku, name, price_sell' },
                { status: 400 }
            );
        }

        // Prepare product data
        const productData: any = {
            sku,
            name,
            type: type || 'PHYSICAL',
            category: category || 'GENERAL',
            category_name,
            price_base: price_base || price_sell,
            price_sell,
            description,
            image_url: image_url || [],
            min_order: min_order || 1,
            max_order: max_order || 10000,
            is_active: is_active !== false, // Default true
            is_featured: is_featured || false,
            provider_config: provider_config || null,
            updated_at: new Date().toISOString(),
        };

        // Set stock based on product type
        if (type === 'DIGITAL_SMM' || type === 'DIGITAL') {
            productData.stock = 999999; // Unlimited for digital
        } else {
            productData.stock = stock || 0;
        }

        // Upsert product
        const { data, error } = await supabase
            .from('marketplace_products')
            .upsert(productData, { onConflict: 'sku' })
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log('[Admin Product] Product upserted:', data.sku);

        return NextResponse.json({
            success: true,
            message: 'Product created/updated successfully',
            data,
        });
    } catch (error: any) {
        console.error('[Admin Product] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create/update product',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// DELETE /api/admin/product/manage
// Soft delete product (set is_active = false)
// ==========================================

export async function DELETE(req: Request) {
    try {
        // Security check
        if (!checkAdmin(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const sku = searchParams.get('sku');

        if (!id && !sku) {
            return NextResponse.json(
                { error: 'Missing parameter: id or sku required' },
                { status: 400 }
            );
        }

        // Build query
        let query = supabase.from('marketplace_products').update({ is_active: false });

        if (id) {
            query = query.eq('id', id);
        } else if (sku) {
            query = query.eq('sku', sku);
        }

        const { error, data } = await query.select();

        if (error) {
            throw error;
        }

        console.log(`[Admin Product] Product deactivated:`, id || sku);

        return NextResponse.json({
            success: true,
            message: 'Product deactivated successfully',
            data,
        });
    } catch (error: any) {
        console.error('[Admin Product] Delete error:', error);
        return NextResponse.json(
            {
                error: 'Failed to deactivate product',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// GET /api/admin/product/manage
// Get product(s) for management
// ==========================================

export async function GET(req: Request) {
    try {
        // Security check
        if (!checkAdmin(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const sku = searchParams.get('sku');
        const type = searchParams.get('type');
        const include_inactive = searchParams.get('include_inactive') === 'true';

        let query = supabase.from('marketplace_products').select('*');

        // Filters
        if (id) {
            query = query.eq('id', id);
        }

        if (sku) {
            query = query.eq('sku', sku);
        }

        if (type) {
            query = query.eq('type', type);
        }

        if (!include_inactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            products: data,
            count: data?.length || 0,
        });
    } catch (error: any) {
        console.error('[Admin Product] Get error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch products',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// ==========================================
// PATCH /api/admin/product/manage
// Quick update specific fields
// ==========================================

export async function PATCH(req: Request) {
    try {
        // Security check
        if (!checkAdmin(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { id, sku, updates } = body;

        if ((!id && !sku) || !updates) {
            return NextResponse.json(
                { error: 'Missing parameters: (id or sku) and updates required' },
                { status: 400 }
            );
        }

        // Build query
        let query = supabase.from('marketplace_products').update({
            ...updates,
            updated_at: new Date().toISOString(),
        });

        if (id) {
            query = query.eq('id', id);
        } else if (sku) {
            query = query.eq('sku', sku);
        }

        const { data, error } = await query.select().single();

        if (error) {
            throw error;
        }

        console.log('[Admin Product] Product updated:', data.sku);

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully',
            data,
        });
    } catch (error: any) {
        console.error('[Admin Product] Patch error:', error);
        return NextResponse.json(
            {
                error: 'Failed to update product',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
