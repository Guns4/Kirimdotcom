#!/bin/bash

# setup-storage-plan.sh
# Subscription Revenue (Phase 1961-1975)
# features: Storage Quota, Paywall, Premium Upgrade

echo ">>> Setting up Storage Subscription Plan..."

# 1. Database Migration
mkdir -p supabase/migrations
cat > supabase/migrations/20251231_storage_quota.sql <<EOF
-- Add Storage Columns to Profiles (assuming 'profiles' table exists, if not create basic structure)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT
);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS storage_limit BIGINT DEFAULT 52428800, -- 50MB Default
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'FREE'; -- FREE, PREMIUM

-- Function to increment storage used
CREATE OR REPLACE FUNCTION increment_storage_used(user_id UUID, bytes BIGINT)
RETURNS VOID AS \$\$
BEGIN
  UPDATE public.profiles
  SET storage_used = storage_used + bytes
  WHERE id = user_id;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;
EOF

# 2. Create Storage Service (Logic)
mkdir -p src/lib
cat > src/lib/storage-service.ts <<EOF
import { createClient } from '@/utils/supabase/client';

export const PLANS = {
  FREE: { limit: 50 * 1024 * 1024, name: 'Free Plan', price: 0 },
  PREMIUM: { limit: 10 * 1024 * 1024 * 1024, name: 'Cloud+ (10GB)', price: 10000 }
};

export const StorageService = {
  /**
   * Check if user has enough space
   */
  async checkQuota(fileSize: number): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('profiles')
      .select('storage_used, storage_limit')
      .eq('id', user.id)
      .single();

    if (!data) return true; // Default allow if no profile found (optimistic)

    return (data.storage_used + fileSize) <= data.storage_limit;
  },

  /**
   * Update usage after upload
   */
  async recordUpload(fileSize: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('increment_storage_used', { 
        user_id: user.id, 
        bytes: fileSize 
    });
  },

  /**
   * Upgrade to Premium (Mock Payment)
   */
  async upgradeToPremium() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');

    // 1. Check Wallet Balance (TODO: Implement actual wallet check)
    // const hasBalance = await WalletService.checkBalance(user.id, PLANS.PREMIUM.price);
    // if (!hasBalance) throw new Error('Saldo tidak mencukupi');

    // 2. Mock Deduction & Upgrade
    const { error } = await supabase
        .from('profiles')
        .update({ 
            subscription_tier: 'PREMIUM',
            storage_limit: PLANS.PREMIUM.limit
        })
        .eq('id', user.id);

    if (error) throw error;
    
    return { success: true };
  }
};
EOF

# 3. Create Paywall UI (Usage Bar & Upgrade Modal)
mkdir -p src/components/subscription
cat > src/components/subscription/StorageWidget.tsx <<EOF
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Cloud, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StorageService, PLANS } from '@/lib/storage-service';
import { useRouter } from 'next/navigation';

export function StorageWidget() {
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(PLANS.FREE.limit);
  const [tier, setTier] = useState('FREE');
  const router = useRouter();

  useEffect(() => {
    const fetchUsage = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        
        const { data } = await supabase
            .from('profiles')
            .select('storage_used, storage_limit, subscription_tier')
            .eq('id', user.id)
            .single();
            
        if (data) {
            setUsage(data.storage_used || 0);
            setLimit(data.storage_limit || PLANS.FREE.limit);
            setTier(data.subscription_tier || 'FREE');
        }
    };
    fetchUsage();
  }, []);

  const percentage = Math.min(100, (usage / limit) * 100);
  const isFull = percentage >= 90;

  const handleUpgrade = async () => {
      try {
          await StorageService.upgradeToPremium();
          alert('Upgrade Berhasil! Limit Anda sekarang 10GB.');
          window.location.reload();
      } catch (e) {
          alert('Upgrade Gagal. Pastikan saldo mencukupi.');
      }
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-700">
                <Cloud className="w-5 h-5" />
                <span className="font-semibold text-sm">Penyimpanan</span>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">{tier}</span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
                className={\`h-2.5 rounded-full \${isFull ? 'bg-red-500' : 'bg-blue-600'}\`} 
                style={{ width: \`\${percentage}%\` }}
            ></div>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
            <span>{(usage / 1024 / 1024).toFixed(1)} MB</span>
            <span>of {(limit / 1024 / 1024).toFixed(0)} MB</span>
        </div>

        {tier === 'FREE' && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <h4 className="font-semibold text-orange-800 text-sm mb-1">Penyimpanan Hampir Penuh?</h4>
                <p className="text-orange-600 text-[10px] mb-3">
                    Upgrade ke <strong>Cloud+ (10GB)</strong> hanya <strong>Rp 10rb/thn</strong> untuk simpan ribuan foto garansi.
                </p>
                <Button onClick={handleUpgrade} size="sm" className="w-full bg-orange-500 hover:bg-orange-600 border-none text-white">
                    <ArrowUpCircle className="w-4 h-4 mr-1" />
                    Upgrade Sekarang
                </Button>
            </div>
        )}
    </div>
  );
}
EOF

# 4. Create Page to View Storage
mkdir -p src/app/dashboard/storage
cat > src/app/dashboard/storage/page.tsx <<EOF
import { StorageWidget } from '@/components/subscription/StorageWidget';

export default function StoragePage() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
        <h1 className="text-xl font-bold">Kelola Penyimpanan</h1>
        <StorageWidget />
    </div>
  );
}
EOF

echo ">>> Storage Subscription Plan Setup Complete."
