'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface PurchaseBundleResult {
    success: boolean;
    message: string;
    purchaseId?: string;
    error?: string;
}

/**
 * Purchase a bundle package
 * This is a simplified version - integrate with actual payment gateway
 */
export async function purchaseBundle(
    bundleSlug: string,
    paymentMethod: string = 'pending'
): Promise<PurchaseBundleResult> {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: 'Anda harus login terlebih dahulu',
                error: 'UNAUTHORIZED',
            };
        }

        // Get bundle details
        const { data: bundle, error: bundleError } = await supabase
            .from('bundle_products')
            .select('*')
            .eq('bundle_slug', bundleSlug)
            .eq('is_active', true)
            .single();

        if (bundleError || !bundle) {
            return {
                success: false,
                message: 'Paket tidak ditemukan',
                error: 'BUNDLE_NOT_FOUND',
            };
        }

        // Check stock (if not unlimited)
        if (!bundle.stock_unlimited && bundle.stock_quantity <= 0) {
            return {
                success: false,
                message: 'Maaf, stok paket sudah habis',
                error: 'OUT_OF_STOCK',
            };
        }

        // Create purchase record
        const { data: purchase, error: purchaseError } = await supabase
            .from('bundle_purchases')
            .insert({
                bundle_id: bundle.id,
                user_id: user.id,
                amount_paid: bundle.bundle_price,
                payment_method: paymentMethod,
                payment_status: 'pending', // Will be updated by payment gateway callback
            })
            .select()
            .single();

        if (purchaseError) {
            console.error('Purchase error:', purchaseError);
            return {
                success: false,
                message: 'Terjadi kesalahan saat memproses pembelian',
                error: 'PURCHASE_FAILED',
            };
        }

        // Update stock if not unlimited
        if (!bundle.stock_unlimited) {
            await supabase
                .from('bundle_products')
                .update({ stock_quantity: bundle.stock_quantity - 1 })
                .eq('id', bundle.id);
        }

        revalidatePath('/starter-kit');

        return {
            success: true,
            message: 'Pembelian berhasil! Silakan lanjutkan pembayaran.',
            purchaseId: purchase.id,
        };
    } catch (error) {
        console.error('Unexpected error in purchaseBundle:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan sistem',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Get user's bundle purchases
 */
export async function getUserBundlePurchases() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
        .from('bundle_purchases')
        .select(
            `
      *,
      bundle_products (
        bundle_name,
        bundle_slug,
        items,
        features
      )
    `
        )
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

    return { data, error };
}

/**
 * Fulfill bundle purchase (called after payment confirmation)
 */
export async function fulfillBundlePurchase(
    purchaseId: string
): Promise<PurchaseBundleResult> {
    try {
        const supabase = await createClient();

        // Update purchase status
        const { error } = await supabase
            .from('bundle_purchases')
            .update({
                payment_status: 'completed',
                fulfilled: true,
                fulfilled_at: new Date().toISOString(),
                fulfillment_data: {
                    // Track what was delivered
                    ebook_delivered: true,
                    premium_activated: true,
                    template_delivered: true,
                },
            })
            .eq('id', purchaseId);

        if (error) {
            return {
                success: false,
                message: 'Gagal memproses fulfillment',
                error: 'FULFILLMENT_FAILED',
            };
        }

        // TODO: Trigger actual fulfillment actions:
        // - Grant premium access
        // - Send ebook download link
        // - Provide template access

        revalidatePath('/dashboard');

        return {
            success: true,
            message: 'Paket berhasil diaktifkan!',
        };
    } catch (error) {
        console.error('Fulfillment error:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan sistem',
            error: 'SYSTEM_ERROR',
        };
    }
}
