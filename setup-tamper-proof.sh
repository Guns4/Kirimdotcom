#!/bin/bash

# setup-tamper-proof.sh
# ---------------------
# Sets up Backend Recalculation & Tamper Logging
# Ensures user cannot manipulate price from Client Side

echo "🛡️  Setting up Tamper-Proof Checkout..."

mkdir -p src/lib/billing
mkdir -p supabase/migrations

# 1. Create Schema for Suspicious Activity API
cat > supabase/migrations/tamper_proof_schema.sql << 'EOF'
CREATE TABLE IF NOT EXISTS public.suspicious_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.suspicious_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view key logs
CREATE POLICY "Admins can view suspicious logs" ON public.suspicious_activity_logs
    FOR SELECT TO authenticated
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE '%@cekkirim.com')); -- Simple admin check or use role
EOF

# 2. Create Typescript Logic
cat > src/lib/billing/checkout-guard.ts << 'EOF'
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
EOF

echo "✅ Guard created at src/lib/billing/checkout-guard.ts"
echo "✅ Schema created at supabase/migrations/tamper_proof_schema.sql"
