#!/bin/bash

# =============================================================================
# Predictive Sales: Restock Reminder Setup
# =============================================================================

echo "Initializing Restock Reminder..."
echo "================================================="

# 1. SQL Schema (Inventory Tracking)
echo "1. Generating SQL: restock_schema.sql"
cat <<EOF > restock_schema.sql
-- User Inventory Table to track estimated supplies
CREATE TABLE IF NOT EXISTS public.user_supply_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'lakban', 'plastik'
    estimated_stock DECIMAL(19,4) NOT NULL DEFAULT 0, -- in Meters or Units
    last_restock_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, item_type)
);

-- Table to store Generated Alerts
CREATE TABLE IF NOT EXISTS public.supply_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'LOW_STOCK_Lakban'
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

# 2. Cron Job (Consumption Logic)
echo "2. Creating API: src/app/api/cron/predict-restock/route.ts"
mkdir -p src/app/api/cron/predict-restock

cat <<EOF > src/app/api/cron/predict-restock/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
         return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    
    // 1. Get all users with inventory tracking (or active sellers)
    // For demo, we select users who have purchased supplies
    const { data: inventories } = await supabase
        .from('user_supply_inventory')
        .select('*');
        
    if (!inventories) return NextResponse.json({ processed: 0 });
    
    let alertCount = 0;

    for (const inv of inventories) {
        if (inv.item_type !== 'lakban') continue;
        
        // 2. Calculate Consumption
        // Logic: Count receipts created since last_restock_at
        const { count, error } = await supabase
            .from('transactions') // Assuming 'transactions' or 'orders' table stores Resi
            .select('id', { count: 'exact', head: true })
            .eq('user_id', inv.user_id)
            .gte('created_at', inv.last_restock_at);
            
        if (error || count === null) continue;
        
        // Consumption: 0.5 meter per Resi
        const usedMeters = count * 0.5; 
        // Initial Stock (from DB) - Used
        const currentEstimated = inv.estimated_stock - usedMeters;
        
        // 3. Check Threshold (e.g. < 10 meters remaining)
        if (currentEstimated < 10) {
            // Trigger Alert
            const { error: alertError } = await supabase.from('supply_alerts').upsert({
                user_id: inv.user_id,
                alert_type: 'LOW_STOCK_Lakban',
                message: 'Stok Lakban Menipis! Estimasi sisa < 10m. Beli sekarang, diskon ongkir instan.',
                is_active: true
            }, { onConflict: 'user_id, alert_type' }); // Ensure only one active alert per type
            
            if (!alertError) alertCount++;
        }
    }

    return NextResponse.json({ processed: inventories.length, alerts_generated: alertCount });
}
EOF

# 3. UI Component (Alert)
echo "3. Creating Component: src/components/supply/RestockAlert.tsx"
mkdir -p src/components/supply

cat <<EOF > src/components/supply/RestockAlert.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AlertTriangle, X, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export function RestockAlert() {
    const [alert, setAlert] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        checkAlerts();
    }, []);

    async function checkAlerts() {
        // Fetch active alerts for current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('supply_alerts')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .eq('alert_type', 'LOW_STOCK_Lakban')
            .single();
            
        if (data) setAlert(data);
    }

    async function handleReorder() {
        // Mock Reorder Action
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Memproses pesanan ulang...',
                success: 'Pesanan Lakban berhasil dibuat! (Saldo terpotong)',
                error: 'Gagal membuat pesanan'
            }
        );
        dismissAlert();
    }

    async function dismissAlert() {
        if (!alert) return;
        setAlert(null);
        await supabase
            .from('supply_alerts')
            .update({ is_active: false })
            .eq('id', alert.id);
    }

    if (!alert) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-white border-l-4 border-yellow-500 shadow-xl rounded-r-lg p-4 max-w-sm flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">Stok Menipis!</h3>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    
                    <div className="flex gap-2 mt-3">
                        <button 
                            onClick={handleReorder}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 shadow-sm transition-colors"
                        >
                            <ShoppingCart className="w-3 h-3" />
                            Re-order Instan
                        </button>
                        <button 
                            onClick={dismissAlert}
                            className="text-gray-400 hover:text-gray-600 text-xs py-1.5 px-2"
                        >
                            Nanti Saja
                        </button>
                    </div>
                </div>

                <button onClick={dismissAlert} className="text-gray-300 hover:text-gray-500">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Restock Reminder Setup Complete!"
echo "1. Run 'restock_schema.sql'."
echo "2. Import <RestockAlert /> in Dashboard Layout."
