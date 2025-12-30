'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAdCampaign(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const bannerFile = formData.get('banner') as File;
    const campaignName = formData.get('campaignName') as string;
    const targetUrl = formData.get('targetUrl') as string;
    const initialBudget = Number(formData.get('budget'));
    const couriersStr = formData.get('couriers')?.toString() || '';
    const couriers = couriersStr ? couriersStr.split(',').map(c => c.trim()).filter(Boolean) : [];

    // 1. Upload Banner
    let bannerUrl = '';
    if (bannerFile && bannerFile.size > 0) {
        const fileName = `ads/${user.id}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage.from('ads-content').upload(fileName, bannerFile);
        if (uploadError) return { error: 'Upload failed' };

        bannerUrl = supabase.storage.from('ads-content').getPublicUrl(fileName).data.publicUrl;
    }

    // 2. Create Campaign
    const { error } = await (supabase as any).from('ad_campaigns').insert({
        advertiser_id: user.id,
        advertiser_name: user.email || 'Seller',
        campaign_name: campaignName,
        banner_url: bannerUrl,
        target_url: targetUrl,
        slot_position: 'below_tracking',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        is_approved: true,
        current_balance: initialBudget,
        cost_per_view: 100,
        targeting_couriers: couriers.length > 0 ? couriers : null,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await (supabase as any)
        .from('ad_campaigns')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

    return data || [];
}
