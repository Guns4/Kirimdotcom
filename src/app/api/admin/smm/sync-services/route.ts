import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSmmServices } from '@/lib/api/smm-provider';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// POST /api/admin/smm/sync-services
// Automated service import from SMM provider
// ==========================================

interface SyncOptions {
    markup_percent?: number;  // e.g., 0.40 for 40%
    markup_flat?: number;     // e.g., 5000 for Rp 5,000
    auto_activate?: boolean;   // Auto-activate synced services
    category_filter?: string[]; // Only sync specific categories
}

export async function POST(req: Request) {
    try {
        // ==========================================
        // 🔒 SECURITY CHECK: Admin Secret
        // ==========================================
        const adminSecret = req.headers.get('x-admin-secret');

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) {
            console.warn('[SMM Sync] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[SMM Sync] ✅ Admin authenticated');

        // ==========================================
        // 1. Get Sync Options
        // ==========================================
        const body = await req.json().catch(() => ({}));
        const options: SyncOptions = {
            markup_percent: body.markup_percent || 0.40, // Default 40%
            markup_flat: body.markup_flat || 0,
            auto_activate: body.auto_activate !== false, // Default true
            category_filter: body.category_filter || [],
        };

        console.log('[SMM Sync] Sync options:', options);

        // ==========================================
        // 2. Fetch Services from Provider
        // ==========================================
        console.log('[SMM Sync] Fetching services from provider...');

        const services = await getSmmServices();

        if (!services || services.length === 0) {
            throw new Error('No services returned from provider. Check API credentials.');
        }

        console.log(`[SMM Sync] Found ${services.length} services from provider`);

        // ==========================================
        // 3. Process & Import Services
        // ==========================================
        let importedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        for (const service of services) {
            try {
                // Skip if category filter is set and service doesn't match
                if (
                    options.category_filter &&
                    options.category_filter.length > 0 &&
                    !options.category_filter.includes(service.category)
                ) {
                    skippedCount++;
                    continue;
                }

                // Parse pricing
                const modalPrice = parseFloat(service.price) || 0;

                if (modalPrice <= 0) {
                    console.warn(`[SMM Sync] Invalid price for service ${service.id}: ${service.price}`);
                    skippedCount++;
                    continue;
                }

                // ==========================================
                // 💰 INTELLIGENT MARKUP CALCULATION
                // ==========================================
                let sellPrice = modalPrice;

                // Apply percentage markup
                if (options.markup_percent && options.markup_percent > 0) {
                    sellPrice = modalPrice + modalPrice * options.markup_percent;
                }

                // Apply flat markup
                if (options.markup_flat && options.markup_flat > 0) {
                    sellPrice += options.markup_flat;
                }

                // Round up to nearest 100 for cleaner pricing
                sellPrice = Math.ceil(sellPrice / 100) * 100;

                // Ensure minimum profit margin of Rp 1,000
                if (sellPrice - modalPrice < 1000) {
                    sellPrice = modalPrice + 1000;
                }

                // ==========================================
                // 4. Upsert to Database
                // ==========================================
                const productData = {
                    sku: `SMM-${service.id}`,
                    ref_id: service.id.toString(),
                    name: service.name || `Service ${service.id}`,
                    description: service.description || null,
                    type: 'DIGITAL_SMM',
                    category: 'SMM',
                    category_name: service.category || 'Other',
                    price_base: modalPrice,
                    price_sell: sellPrice,
                    min_order: parseInt(service.min) || 100,
                    max_order: parseInt(service.max) || 100000,
                    stock: 999999, // Digital services are always available
                    is_active: options.auto_activate,
                    is_featured: false,
                    provider_config: {
                        service_id: service.id.toString(),
                        provider: process.env.SMM_PROVIDER_NAME || 'Default',
                        category: service.category,
                        type: service.type,
                    },
                };

                const { error, data } = await supabase
                    .from('marketplace_products')
                    .upsert(productData, {
                        onConflict: 'sku',
                        ignoreDuplicates: false,
                    })
                    .select();

                if (error) {
                    console.error(`[SMM Sync] Failed to upsert service ${service.id}:`, error);
                    errors.push(`${service.name}: ${error.message}`);
                    continue;
                }

                // Check if it was an insert or update
                if (data && data.length > 0) {
                    // Check if product already existed
                    const { data: existing } = await supabase
                        .from('marketplace_products')
                        .select('id')
                        .eq('sku', `SMM-${service.id}`)
                        .single();

                    if (existing) {
                        updatedCount++;
                    } else {
                        importedCount++;
                    }
                }

                console.log(`[SMM Sync] ✅ Synced: ${service.name} (Modal: ${modalPrice}, Jual: ${sellPrice})`);
            } catch (serviceError: any) {
                console.error(`[SMM Sync] Error processing service ${service.id}:`, serviceError);
                errors.push(`${service.name || service.id}: ${serviceError.message}`);
            }
        }

        // ==========================================
        // 5. Return Summary
        // ==========================================
        console.log('[SMM Sync] ✅ Sync completed', {
            total: services.length,
            imported: importedCount,
            updated: updatedCount,
            skipped: skippedCount,
            errors: errors.length,
        });

        return NextResponse.json({
            success: true,
            message: `Service sync completed successfully`,
            summary: {
                total_services: services.length,
                newly_imported: importedCount,
                updated: updatedCount,
                skipped: skippedCount,
                errors: errors.length,
            },
            pricing: {
                markup_percent: options.markup_percent,
                markup_flat: options.markup_flat,
                example:
                    services.length > 0
                        ? {
                            service: services[0].name,
                            modal: parseFloat(services[0].price),
                            jual: Math.ceil(
                                (parseFloat(services[0].price) +
                                    parseFloat(services[0].price) * (options.markup_percent || 0) +
                                    (options.markup_flat || 0)) /
                                100
                            ) * 100,
                            profit:
                                Math.ceil(
                                    (parseFloat(services[0].price) +
                                        parseFloat(services[0].price) * (options.markup_percent || 0) +
                                        (options.markup_flat || 0)) /
                                    100
                                ) *
                                100 -
                                parseFloat(services[0].price),
                        }
                        : null,
            },
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Show first 10 errors
        });
    } catch (error: any) {
        console.error('[SMM Sync] Fatal error:', error);
        return NextResponse.json(
            {
                error: 'Service sync failed',
                details: error.message,
                hint: 'Check your SMM provider credentials (SMM_API_ID, SMM_API_KEY)',
            },
            { status: 500 }
        );
    }
}

// ==========================================
// GET /api/admin/smm/sync-services
// Get sync status and preview
// ==========================================

export async function GET(req: Request) {
    try {
        // Security check
        const adminSecret = req.headers.get('x-admin-secret');

        if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current synced services count
        const { count: totalServices, error: countError } = await supabase
            .from('marketplace_products')
            .select('*', { count: 'exact', head: true })
            .eq('type', 'DIGITAL_SMM');

        if (countError) {
            throw countError;
        }

        // Get active services count
        const { count: activeServices } = await supabase
            .from('marketplace_products')
            .select('*', { count: 'exact', head: true })
            .eq('type', 'DIGITAL_SMM')
            .eq('is_active', true);

        // Get latest sync info
        const { data: latestServices } = await supabase
            .from('marketplace_products')
            .select('created_at, updated_at')
            .eq('type', 'DIGITAL_SMM')
            .order('updated_at', { ascending: false })
            .limit(1);

        return NextResponse.json({
            success: true,
            current_status: {
                total_smm_services: totalServices || 0,
                active_services: activeServices || 0,
                inactive_services: (totalServices || 0) - (activeServices || 0),
                last_sync: latestServices && latestServices.length > 0 ? latestServices[0].updated_at : null,
            },
            provider: {
                name: process.env.SMM_PROVIDER_NAME || 'Not configured',
                url: process.env.SMM_PROVIDER_URL || 'Not configured',
                configured: !!(process.env.SMM_API_ID && process.env.SMM_API_KEY),
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                error: 'Failed to get sync status',
                details: error.message,
            },
            { status: 500 }
        );
    }
}
