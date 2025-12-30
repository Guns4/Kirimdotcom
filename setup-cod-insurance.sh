#!/bin/bash

# =============================================================================
# Insurance: COD Return Protection Setup (Task 89)
# =============================================================================

echo "Initializing COD Insurance System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: cod_insurance_schema.sql"
cat <<EOF > cod_insurance_schema.sql
-- Table: COD Insurance Policies
CREATE TABLE IF NOT EXISTS public.cod_insurance_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    resi TEXT NOT NULL,
    premium_amount DECIMAL(19,4) DEFAULT 500, -- Rp 500 per resi
    coverage_amount DECIMAL(19,4) NOT NULL,   -- Shipping Cost (Ongkir)
    status TEXT DEFAULT 'ACTIVE',             -- ACTIVE, EXPIRED (Delivered), CLAIMED
    claim_status TEXT DEFAULT NULL,           -- NULL, AUTO_APPROVED, PAID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cod_insurance_resi ON public.cod_insurance_policies(resi);
CREATE INDEX IF NOT EXISTS idx_cod_insurance_status ON public.cod_insurance_policies(status);
EOF

# 2. Cron Job Logic (Auto-Claim Detector)
echo "2. Creating Cron: src/app/api/cron/insurance/cod-return/route.ts"
mkdir -p src/app/api/cron/insurance/cod-return

cat <<EOF > src/app/api/cron/insurance/cod-return/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();

    // 1. Find 'ACTIVE' policies
    const { data: policies } = await supabase
        .from('cod_insurance_policies')
        .select('*')
        .eq('status', 'ACTIVE');

    if (!policies || policies.length === 0) return NextResponse.json({ processed: 0 });

    let claimCount = 0;

    // 2. Check Tracking Status for each policy
    // In real app, we might check an internal 'shipments' table or external API
    // For demo, we check a mock behavior or assume we have tracking data mirrored locally
    
    for (const policy of policies) {
        // MOCK CHECK: Fetch status from our local 'transactions' or 'tracking' table ideally
        // We'll simulate by checking if tracking info exists with 'RETURN_TO_SENDER'
        
        // Let's assume we maintain a 'shipments' table updated by webhooks
        // const { data: shipment } = await supabase.from('shipments').select('status').eq('resi', policy.resi).single();
        // const status = shipment?.status;

        // SIMULATION FOR DEMO:
        // We act if we find a shipment logic. Here we just show the logic structure.
        const simulatedStatus = 'RETURN_TO_SENDER'; // Force true for demo purpose on running cron? No, better limit it.
        
        // Real Logic Implementation:
        /*
        if (status === 'RETURN_TO_SENDER' || status === 'GAGAL_KIRIM') {
             // TRIGGER CLAIM
        } else if (status === 'DELIVERED') {
             // EXPIRE POLICY
        }
        */

       // We will just return the logic structure here as we don't have a live tracking feed to poll against.
    }

    return NextResponse.json({ 
        message: 'Cron logic ready. Connect to shipment tracking source.',
        checked: policies.length 
    });
}
EOF

# Note: Updating the Cron Route to be more robust for the file creation
# Let's overwrite it with a version that actually mimics doing something if we link it to Global Tracking
cat <<EOF > src/app/api/cron/insurance/cod-return/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();

    // 1. Get polices (simulating batch processing)
    const { data: policies } = await supabase
        .from('cod_insurance_policies')
        .select('*')
        .eq('status', 'ACTIVE')
        .limit(50);

    if (!policies?.length) return NextResponse.json({ processed: 0 });

    let approved = 0;

    for (const policy of policies) {
        // 2. Check Tracking (Mocking integration with Global Tracking table if it existed, or just mock check)
        // If we integrated with Task 24 (Global Tracking), we could query 'tracking_history'
        
        // Mock: If resi ends with 'RET', we treat as Returned
        const isReturned = policy.resi.endsWith('RET'); 
        const isDelivered = policy.resi.endsWith('DEL');

        if (isReturned) {
            // AUTO APPROVE CLAIM
            const { error: claimError } = await supabase
                .from('cod_insurance_policies')
                .update({ 
                    status: 'CLAIMED', 
                    claim_status: 'AUTO_APPROVED' 
                })
                .eq('id', policy.id);

            if (!claimError) {
                // Credit Wallet (Refund Ongkir)
                await supabase.from('ledger_entries').insert({
                    user_id: policy.user_id,
                    amount: policy.coverage_amount,
                    type: 'INSURANCE_CLAIM',
                    description: \`Klaim Asuransi Retur COD (Resi: \${policy.resi})\`
                });
                approved++;
            }
        } else if (isDelivered) {
             await supabase
                .from('cod_insurance_policies')
                .update({ status: 'EXPIRED' }) // Coverage ends on delivery
                .eq('id', policy.id);
        }
    }

    return NextResponse.json({ 
        success: true, 
        processed: policies.length, 
        claims_approved: approved 
    });
}
EOF

# 3. UI Component (Checkout Toggle)
echo "3. Creating UI: src/components/insurance/CodInsuranceToggle.tsx"
mkdir -p src/components/insurance

cat <<EOF > src/components/insurance/CodInsuranceToggle.tsx
'use client';

import { ShieldCheck } from 'lucide-react';

interface CodInsuranceToggleProps {
    checked: boolean;
    onToggle: (val: boolean) => void;
    ongkirAmount: number;
}

export function CodInsuranceToggle({ checked, onToggle, ongkirAmount }: CodInsuranceToggleProps) {
    const PREMIUM = 500;

    return (
        <div 
            onClick={() => onToggle(!checked)}
            className={\`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition-all \${
                checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-200'
            }\`}
        >
            <div className="flex items-center gap-3">
                <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${checked ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}\`}>
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">Asuransi Retur COD</h4>
                    <p className="text-sm text-gray-500">
                        Ganti rugi Ongkir 100% jika paket ditolak/retur.
                    </p>
                </div>
            </div>
            
            <div className="text-right">
                <p className="text-sm font-bold text-gray-900">+Rp {PREMIUM}</p>
                {checked && (
                    <p className="text-xs text-green-700 font-semibold">
                        Coverage: Rp {ongkirAmount.toLocaleString('id-ID')}
                    </p>
                )}
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "COD Insurance Setup Complete!"
echo "1. Run 'cod_insurance_schema.sql'."
echo "2. Use <CodInsuranceToggle /> at Checkout."
echo "3. Cron checks for status (Mock: Resi ending in 'RET')."
