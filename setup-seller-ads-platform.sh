#!/bin/bash

# =============================================================================
# Ad Revenue: Seller Ads Platform (Self-Service)
# =============================================================================

echo "Initializing Seller Ads Platform..."
echo "================================================="

# 1. SQL Update
echo "1. Generating SQL Update: seller_ads_update.sql"
cat <<EOF > seller_ads_update.sql
-- Extend ad_campaigns for Self-Service Features
ALTER TABLE public.ad_campaigns
ADD COLUMN IF NOT EXISTS targeting_couriers TEXT[], -- ['jne', 'jnt'] or NULL for all
ADD COLUMN IF NOT EXISTS targeting_locations TEXT[], -- ['jakarta'] or NULL for all
ADD COLUMN IF NOT EXISTS current_balance DECIMAL(12, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cost_per_view DECIMAL(10, 2) DEFAULT 100.00;

-- Update track_ad_impression to handle budget deduction
CREATE OR REPLACE FUNCTION track_ad_impression_with_budget(
  p_campaign_id UUID,
  p_viewer_ip VARCHAR,
  p_page_url TEXT
) RETURNS VOID AS \$\$
DECLARE
  v_details RECORD;
BEGIN
  -- Get current balance & cpv
  SELECT current_balance, cost_per_view, status INTO v_details
  FROM public.ad_campaigns WHERE id = p_campaign_id;

  -- Only track if active
  IF v_details.status = 'active' THEN
     -- Insert impression
     INSERT INTO public.ad_impressions (campaign_id, viewer_ip, page_url)
     VALUES (p_campaign_id, p_viewer_ip, p_page_url);

     -- Update stats and deduct balance
     UPDATE public.ad_campaigns
     SET total_impressions = total_impressions + 1,
         current_balance = current_balance - cost_per_view,
         status = CASE 
            WHEN (current_balance - cost_per_view) <= 0 THEN 'completed' 
            ELSE status 
         END,
         updated_at = NOW()
     WHERE id = p_campaign_id;
  END IF;
END;
\$\$ LANGUAGE plpgsql;
EOF

# 2. Server Actions
echo "2. Creating Server Actions: src/app/actions/ads.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/ads.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAdCampaign(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const bannerFile = formData.get('banner') as File;
  const campaignName = formData.get('campaignName') as string;
  const targetUrl = formData.get('targetUrl') as string;
  const initialBudget = Number(formData.get('budget'));
  const couriers = formData.get('couriers')?.toString().split(',') || []; // "jne,jnt"
  
  // 1. Upload Banner
  let bannerUrl = '';
  if (bannerFile) {
     const fileName = \`ads/\${user.id}-\${Date.now()}.png\`; // Simplify extension logic
     // Assume bucket 'ads-content' exists
     const { error: uploadError } = await supabase.storage.from('ads-content').upload(fileName, bannerFile);
     if (uploadError) return { error: 'Upload failed' };
     
     bannerUrl = supabase.storage.from('ads-content').getPublicUrl(fileName).data.publicUrl;
  }

  // 2. Create Campaign
  const { error } = await supabase.from('ad_campaigns').insert({
     advertiser_id: user.id,
     advertiser_name: user.email || 'Seller', // Should use profile name ideally
     campaign_name: campaignName,
     banner_url: bannerUrl,
     target_url: targetUrl,
     slot_position: 'below_tracking', // Default for self-service
     start_date: new Date().toISOString(),
     end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
     status: 'active', // Pending approval in real world, active for demo
     is_approved: true, // Auto approve for demo
     current_balance: initialBudget,
     cost_per_view: 100, // Fixed cost
     targeting_couriers: couriers.length > 0 && couriers[0] !== '' ? couriers : null,
     budget_type: 'cpv'
  });

  if (error) {
      console.error(error);
      return { error: 'Gagal membuat iklan' };
  }

  revalidatePath('/dashboard/ads');
  return { success: true };
}

export async function getMyCampaigns() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });
        
    return data || [];
}
EOF

# 3. UI Components
echo "3. Creating Manager UI: src/components/ads/manager..."
mkdir -p src/components/ads/manager

# Create Form
cat <<EOF > src/components/ads/manager/CreateCampaignForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAdCampaign } from '@/app/actions/ads';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export function CreateCampaignForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createAdCampaign(formData);
    setLoading(false);

    if (res.error) {
        toast.error(res.error);
    } else {
        toast.success('Kampanye Iklan Berhasil Dibuat!');
        // In real app, redirect or reset form
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded-xl bg-card">
       <div className="space-y-2">
          <Label>Nama Kampanye</Label>
          <Input name="campaignName" placeholder="Promo Diskon 50%" required />
       </div>
       
       <div className="space-y-2">
          <Label>Banner Iklan</Label>
          <Input type="file" name="banner" accept="image/*" required />
       </div>

       <div className="space-y-2">
          <Label>Target Link (Landing Page)</Label>
          <Input name="targetUrl" placeholder="https://tokosaya.com/promo" type="url" required />
       </div>

       <div className="space-y-2">
          <Label>Target Kurir (Opsional, pisahkan koma)</Label>
          <Input name="couriers" placeholder="jne, sicepat (Kosongkan untuk semua)" />
       </div>

       <div className="space-y-2">
          <Label>Saldo Awal (Rp)</Label>
          <Input name="budget" type="number" min="10000" placeholder="Min. 10.000" required defaultValue="50000" />
          <p className="text-xs text-muted-foreground">Biaya: Rp 100 per tayang.</p>
       </div>

       <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Memproses...' : 'Terbitkan Iklan'}
       </Button>
    </form>
  );
}
EOF

# Dashboard List
cat <<EOF > src/components/ads/manager/AdsDashboard.tsx
import { getMyCampaigns } from '@/app/actions/ads';
import { Badge } from '@/components/ui/badge';

export async function AdsDashboard() {
  const campaigns = await getMyCampaigns();

  return (
    <div className="space-y-4">
       <h2 className="text-xl font-bold">Kampanye Saya</h2>
       <div className="grid gap-4">
          {campaigns.map((camp: any) => (
             <div key={camp.id} className="flex flex-col md:flex-row items-center gap-4 bg-card border p-4 rounded-xl">
                 <img src={camp.banner_url} alt={camp.campaign_name} className="w-24 h-16 object-cover rounded-md bg-muted" />
                 
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <h3 className="font-bold">{camp.campaign_name}</h3>
                       <Badge variant={camp.status === 'active' ? 'default' : 'secondary'}>{camp.status}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                       <span>👁 {camp.total_impressions} Views</span>
                       <span>🖱 {camp.total_clicks} Clicks</span>
                    </div>
                 </div>

                 <div className="text-right min-w-[120px]">
                    <p className="text-xs text-muted-foreground">Sisa Saldo</p>
                    <p className="font-bold text-lg text-primary">
                       Rp {camp.current_balance?.toLocaleString()}
                    </p>
                 </div>
             </div>
          ))}
          {campaigns.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada iklan.</p>}
       </div>
    </div>
  );
}
EOF

echo ""
echo "================================================="
echo "Ad Platform Setup Complete!"
echo "1. Run 'seller_ads_update.sql' in Supabase."
echo "2. Create Bucket 'ads-content' (Public) in Supabase Storage."
echo "3. Use <AdsDashboard /> and <CreateCampaignForm /> in your Seller/User Dashboard."
