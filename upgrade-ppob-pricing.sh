#!/bin/bash

# =============================================================================
# Upgrade PPOB Pricing (Phase 130)
# Revenue Optimization (Dynamic Margins)
# =============================================================================

echo "Upgrading PPOB Pricing Logic..."
echo "================================================="
echo ""

# 1. API Route
echo "1. Creating API Route: src/app/api/ppob/price/route.ts"
mkdir -p src/app/api/ppob/price

cat <<EOF > src/app/api/ppob/price/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    
    // 1. Get User (for Loyalty Check)
    const { data: { user } } = await supabase.auth.getUser();
    
    // 2. Parse Body
    const { code, costPrice } = await req.json();
    
    if (!costPrice) {
        return NextResponse.json({ error: 'Missing costPrice' }, { status: 400 });
    }

    // 3. Base Margin
    let finalPrice = Number(costPrice) + 500;
    const rulesApplied: string[] = ['Base Margin (+500)'];
    
    // 4. Rule: Night Owl (Jam Kalong) 00:00 - 05:00 WIB
    // Server time usually UTC. WIB is UTC+7.
    const now = new Date();
    const utcHours = now.getUTCHours();
    const wibHours = (utcHours + 7) % 24;

    if (wibHours >= 0 && wibHours < 5) {
        finalPrice += 500;
        rulesApplied.push('Night Surcharge (+500)');
    }

    // 5. Rule: Loyalty Discount
    let isLoyal = false;
    if (user) {
        // Check total transaction stats
        // We assume a 'user_wallets' or 'transaction_stats' table exists, or query transaction logs
        // For efficiency, we'll check 'user_wallets.total_spend' (assuming it exists or mocking it for this phase)
        const { data: wallet } = await supabase
            .from('user_wallets')
            .select('total_spend')
            .eq('user_id', user.id)
            .single();
            
        if (wallet && wallet.total_spend > 1000000) {
            isLoyal = true;
            finalPrice -= 200;
            rulesApplied.push('Loyalty Discount (-200)');
        }
    }

    // Ensure we don't go below cost (safety net)
    if (finalPrice < costPrice) finalPrice = costPrice;

    return NextResponse.json({
        success: true,
        data: {
            code,
            originalPrice: Number(costPrice) + 500, // The "Standard" price for comparison
            finalPrice,
            isDiscounted: isLoyal, // Flag for UI Strikethrough
            rulesApplied
        }
    });
}
EOF
echo "   [✓] API Route created."
echo ""

# 2. Price Display Component
echo "2. Creating Component: src/components/ppob/PriceDisplay.tsx"
mkdir -p src/components/ppob

cat <<EOF > src/components/ppob/PriceDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Tag } from 'lucide-react';

interface PriceDisplayProps {
    productCode: string;
    baseCost: number;
}

export function PriceDisplay({ productCode, baseCost }: PriceDisplayProps) {
    const [priceData, setPriceData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch('/api/ppob/price', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: productCode, costPrice: baseCost })
                });
                const json = await res.json();
                if (json.success) {
                    setPriceData(json.data);
                }
            } catch (error) {
                console.error('Failed to fetch dynamic price', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrice();
    }, [productCode, baseCost]);

    if (loading) return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;

    if (!priceData) return <span className="text-white font-bold">{formatCurrency(baseCost + 500)}</span>;

    return (
        <div className="flex flex-col items-end">
            {priceData.isDiscounted && (
                <span className="text-xs text-gray-400 line-through mr-1">
                    {formatCurrency(priceData.originalPrice)}
                </span>
            )}
            <div className="flex items-center gap-1">
                <span className={\`font-bold text-lg \${priceData.isDiscounted ? 'text-green-400' : 'text-white'}\`}>
                    {formatCurrency(priceData.finalPrice)}
                </span>
                {priceData.isDiscounted && <Tag className="w-3 h-3 text-green-500" />}
            </div>
        </div>
    );
}
EOF
echo "   [✓] PriceDisplay component created."
echo ""

# 3. Database Schema
echo "3. Generating SQL Schema..."
cat <<EOF > ppob_pricing_schema.sql
-- Add configuration column to settings table (if exists, or creating a settings table for it)
-- Assuming a 'settings' table exists, otherwise creating basic one.

CREATE TABLE IF NOT EXISTS public.app_settings (
    key text PRIMARY KEY,
    value jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

INSERT INTO public.app_settings (key, value)
VALUES 
    ('ppob_margin_rules', '{
        "base_margin": 500,
        "night_surcharge": 500,
        "night_start_hour": 0,
        "night_end_hour": 5,
        "loyalty_threshold": 1000000,
        "loyalty_discount": 200
    }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Ensure user_wallets has total_spend if not already
ALTER TABLE public.user_wallets 
ADD COLUMN IF NOT EXISTS total_spend numeric DEFAULT 0;
EOF
echo "   [✓] ppob_pricing_schema.sql created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run ppob_pricing_schema.sql in Supabase."
echo "2. Use <PriceDisplay baseCost={10000} productCode='PLN20' /> in your product list."
echo ""
