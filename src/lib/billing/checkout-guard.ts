import { createClient } from '@/utils/supabase/server';

interface CheckoutRequest {
    productId: string;
    quantity: number;
    userPrice?: number; // Suspicious if present
    userId: string;
}

export async function validateCheckoutSync(req: CheckoutRequest) {
    const supabase = await createClient();

    // 1. Fetch Source of Truth
    const { data: product, error } = await supabase
        .from('supply_products')
        .select('*')
        .eq('id', req.productId)
        .single();

    if (error || !product) {
        throw new Error('Product not found');
    }

    // 2. Server-Side Calculation (The ONLY valid total)
    const validTotal = product.price * req.quantity;

    // 3. Suspicious Activity Detection
    if (req.userPrice !== undefined) {
        if (Math.abs(req.userPrice - validTotal) > 100) { // Tolerance Rp100
            console.warn(`[FRAUD] User ${req.userId} tried to tamper price! Client: ${req.userPrice}, Real: ${validTotal}`);

            // Flag User (Async)
            await supabase.from('suspicious_activity_logs').insert({
                user_id: req.userId,
                action: 'PRICE_TAMPERING',
                details: `Client sent ${req.userPrice}, Real ${validTotal}`,
                ip_address: '0.0.0.0' // Should be passed from caller
            });

            // Optional: Reject transaction?
            // throw new Error('Security Violation: Price Mismatch detected.');
        }
    }

    return { product, validTotal };
}
