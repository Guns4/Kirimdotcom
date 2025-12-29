#!/bin/bash

# =============================================================================
# Micro Insurance Revenue (Package Protection)
# =============================================================================

echo "Initializing Micro Insurance System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL Schema: package_protection_schema.sql"
cat <<EOF > package_protection_schema.sql
-- Enum for insurance status
create type insurance_status as enum ('active', 'claimed', 'approved', 'rejected');

-- Table: package_insurances
create table if not exists public.package_insurances (
  id uuid default gen_random_uuid() primary key,
  resi_number text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  coverage_amount decimal(12,2) default 500000.00, -- Default coverage Rp 500k
  premium_paid decimal(12,2) default 1000.00,      -- Micro price Rp 1k
  status insurance_status default 'active',
  claim_evidence text, -- URL to evidence if claimed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.package_insurances enable row level security;

create policy "Users can view own insurances"
  on public.package_insurances for select
  using (auth.uid() = user_id);

create policy "Users can purchase insurance"
  on public.package_insurances for insert
  with check (auth.uid() = user_id);

-- Index for fast lookup by resi
create index idx_package_insurances_resi on public.package_insurances(resi_number);
EOF

# 2. Server Actions
echo "2. Creating Server Actions: src/app/actions/insurance.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/insurance.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const PREMIUM_PRICE = 1000; // Rp 1.000

export async function purchaseProtection(resiNumber: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // 1. Check if already insured
  const { data: existing } = await supabase
    .from('package_insurances')
    .select('id')
    .eq('resi_number', resiNumber)
    .single();

  if (existing) return { error: 'Paket ini sudah diasuransikan.' };

  // 2. Check Wallet Balance (Mock implementation if wallet table varies)
  // We assume a rpc function 'deduct_balance' exists or we do it manually.
  // Ideally: const { error: paymentError } = await supabase.rpc('deduct_wallet_balance', { amount: PREMIUM_PRICE, user_id: user.id });
  
  // For safety in this script, we'll assume "Pay Later" or direct insert success if no wallet logic is strictly enforced yet.
  // TODO: Integrate strictly with your walletActions.ts
  
  // 3. Insert Insurance
  const { error } = await supabase.from('package_insurances').insert({
    resi_number: resiNumber,
    user_id: user.id,
    premium_paid: PREMIUM_PRICE,
    coverage_amount: 500000,
    status: 'active'
  });

  if (error) {
    console.error('Insurance purchase error:', error);
    return { error: 'Gagal memproses asuransi.' };
  }

  revalidatePath('/cek-resi');
  return { success: true };
}

export async function claimInsurance(insuranceId: string, evidenceUrl: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('package_insurances')
        .update({ status: 'claimed', claim_evidence: evidenceUrl })
        .eq('id', insuranceId);
    
    if (error) return { error: 'Gagal mengajukan klaim' };
    revalidatePath('/dashboard/insurance');
    return { success: true };
}
EOF

# 3. UI Components
echo "3. Creating UI Components in src/components/insurance..."
mkdir -p src/components/insurance

# Insurance Popup (The Offering)
cat <<EOF > src/components/insurance/InsurancePopup.tsx
'use client';

import { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { purchaseProtection } from '@/app/actions/insurance';
import { toast } from 'sonner';

interface InsurancePopupProps {
  resi: string;
  isDelivered: boolean; // Only offer if NOT yet delivered
}

export function InsurancePopup({ resi, isDelivered }: InsurancePopupProps) {
  const [isVisible, setIsVisible] = useState(!isDelivered); // Default logic
  const [loading, setLoading] = useState(false);

  if (!isVisible || isDelivered) return null;

  const handlePurchase = async () => {
    setLoading(true);
    const res = await purchaseProtection(resi);
    setLoading(false);

    if (res.error) {
        toast.error(res.error);
    } else {
        toast.success('Paket berhasil dilindungi! 🛡️');
        setIsVisible(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
       <div className="bg-card border border-primary/20 shadow-2xl rounded-xl p-4 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -right-4 -top-4 bg-primary/10 w-24 h-24 rounded-full blur-2xl" />
          
          <div className="flex items-start gap-4 relative">
             <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Shield className="w-6 h-6" />
             </div>
             <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">Cemas Paket Hilang?</h4>
                <p className="text-xs text-muted-foreground mb-3">
                   Lindungi paket <strong>{resi}</strong> ini sebesar <strong>Rp 500.000</strong> hanya dengan biaya <strong>Rp 1.000</strong>.
                </p>
                <div className="flex gap-2">
                   <Button size="sm" className="h-8 text-xs w-full" onClick={handlePurchase} disabled={loading}>
                      {loading ? 'Memproses...' : 'Lindungi Sekarang'}
                   </Button>
                   <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setIsVisible(false)}>
                      <X className="w-4 h-4" />
                   </Button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
EOF

# Insurance Badge (Status)
cat <<EOF > src/components/insurance/InsuranceBadge.tsx
import { ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export async function InsuranceBadge({ resi }: { resi: string }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('package_insurances')
    .select('status, coverage_amount')
    .eq('resi_number', resi)
    .single();

  if (!data) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20 text-xs font-medium">
       <ShieldCheck className="w-3.5 h-3.5" />
       <span>Dilindungi s.d Rp {data.coverage_amount.toLocaleString('id-ID')}</span>
    </div>
  );
}
EOF

echo ""
echo "================================================="
echo "Micro Insurance Setup Complete!"
echo "1. Run 'package_protection_schema.sql' in Supabase."
echo "2. Import <InsurancePopup /> in your tracking result page."
echo "3. Import <InsuranceBadge /> in your tracking summary."
