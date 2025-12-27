'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface AdResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

/**
 * Create ad campaign (advertiser)
 */
export async function createAdCampaign(
    campaignName: string,
    bannerUrl: string,
    targetUrl: string,
    slotPosition: string,
    startDate: string,
    endDate: string,
    pricePaid: number
): Promise<AdResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        // Create campaign (pending approval)
        const { data: campaign, error } = await supabase
            .from('ad_campaigns')
            .insert({
                advertiser_id: user.id,
                advertiser_name: user.email?.split('@')[0] || 'Advertiser',
                advertiser_email: user.email,
                campaign_name: campaignName,
                banner_url: bannerUrl,
                target_url: targetUrl,
                slot_position: slotPosition,
                start_date: startDate,
                end_date: endDate,
                price_paid: pricePaid,
                status: 'pending',
                is_approved: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating campaign:', error);
            return {
                success: false,
                message: 'Failed to create campaign',
                error: 'CREATE_FAILED',
            };
        }

        revalidatePath('/dashboard/ads');

        return {
            success: true,
            message: 'Campaign created! Waiting for approval.',
            data: campaign,
        };
    } catch (error) {
        console.error('Error in createAdCampaign:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Get advertiser's campaigns
 */
export async function getMyCampaigns() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('ad_campaigns')
            .select('*')
            .eq('advertiser_id', user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return { data: null, error: 'Failed to fetch campaigns' };
    }
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        // Get campaign details
        const { data: campaign } = await supabase
            .from('ad_campaigns')
            .select('*')
            .eq('id', campaignId)
            .eq('advertiser_id', user.id)
            .single();

        if (!campaign) {
            return { data: null, error: 'Campaign not found' };
        }

        // Get recent impressions
        const { data: impressions } = await supabase
            .from('ad_impressions')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('viewed_at', { ascending: false })
            .limit(100);

        // Get recent clicks
        const { data: clicks } = await supabase
            .from('ad_clicks')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('clicked_at', { ascending: false })
            .limit(100);

        return {
            data: {
                campaign,
                impressions: impressions || [],
                clicks: clicks || [],
            },
            error: null,
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return { data: null, error: 'Failed to fetch analytics' };
    }
}

/**
 * Admin: Approve campaign
 */
export async function approveCampaign(campaignId: string): Promise<AdResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        // TODO: Add admin role check here

        const { data, error } = await supabase
            .from('ad_campaigns')
            .update({
                status: 'active',
                is_approved: true,
                approved_at: new Date().toISOString(),
                approved_by: user.id,
            })
            .eq('id', campaignId)
            .select()
            .single();

        if (error) {
            console.error('Error approving campaign:', error);
            return {
                success: false,
                message: 'Failed to approve campaign',
                error: 'APPROVAL_FAILED',
            };
        }

        revalidatePath('/admin/ads');

        return {
            success: true,
            message: 'Campaign approved!',
            data,
        };
    } catch (error) {
        console.error('Error in approveCampaign:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}

/**
 * Pause/Resume campaign
 */
export async function toggleCampaignStatus(
    campaignId: string,
    newStatus: 'active' | 'paused'
): Promise<AdResult> {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                message: 'Unauthorized',
                error: 'UNAUTHORIZED',
            };
        }

        const { data, error } = await supabase
            .from('ad_campaigns')
            .update({ status: newStatus })
            .eq('id', campaignId)
            .eq('advertiser_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating status:', error);
            return {
                success: false,
                message: 'Failed to update status',
                error: 'UPDATE_FAILED',
            };
        }

        revalidatePath('/dashboard/ads');

        return {
            success: true,
            message: `Campaign ${newStatus}!`,
            data,
        };
    } catch (error) {
        console.error('Error in toggleCampaignStatus:', error);
        return {
            success: false,
            message: 'System error',
            error: 'SYSTEM_ERROR',
        };
    }
}
