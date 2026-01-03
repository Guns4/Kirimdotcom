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
     const fileName = `ads/${user.id}-${Date.now()}.png`; // Simplify extension logic
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
