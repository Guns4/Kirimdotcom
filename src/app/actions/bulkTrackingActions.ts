'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Create bulk tracking job from CSV data
 */
export async function createBulkJob(fileName: string, items: Array<{ awb: string, courier: string }>) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'Not authenticated',
            };
        }

        // Check if user is premium
        const { data: profile } = await supabase
            .from('profiles')
            .select('user_subscriptions(is_premium)')
            .eq('id', user.id)
            .single();

        if (!profile?.user_subscriptions?.is_premium) {
            return {
                success: false,
                error: 'PREMIUM_REQUIRED',
                message: 'Fitur ini hanya untuk member Premium',
            };
        }

        // Create job
        const { data: jobId, error } = await supabase.rpc('create_bulk_job', {
            p_user_id: user.id,
            p_file_name: fileName,
            p_file_url: null,
            p_items: JSON.stringify(items),
        });

        if (error) {
            console.error('Error creating bulk job:', error);
            return {
                success: false,
                error: 'Failed to create job',
            };
        }

        return {
            success: true,
            jobId,
            message: `Job created with ${items.length} items`,
        };
    } catch (error) {
        console.error('Error in createBulkJob:', error);
        return {
            success: false,
            error: 'System error',
        };
    }
}

/**
 * Get bulk job status
 */
export async function getBulkJob(jobId: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data: job, error: jobError } = await supabase
            .from('bulk_tracking_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            return { data: null, error: 'Job not found' };
        }

        const { data: items } = await supabase
            .from('bulk_tracking_items')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: true });

        return { data: { job, items: items || [] }, error: null };
    } catch (error) {
        console.error('Error fetching bulk job:', error);
        return { data: null, error: 'Failed to fetch job' };
    }
}

/**
 * Get user's bulk jobs
 */
export async function getBulkJobs(limit: number = 20) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('bulk_tracking_jobs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        return { data, error };
    } catch (error) {
        console.error('Error fetching bulk jobs:', error);
        return { data: null, error: 'Failed to fetch jobs' };
    }
}

/**
 * Process single tracking item (called by queue)
 */
export async function processTrackingItem(itemId: string, awb: string, courier: string) {
    try {
        const supabase = await createClient();

        // TODO: Call actual tracking API here
        // For now, simulate with mock data
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call

        const mockResult = {
            status: 'delivered',
            last_update: new Date().toISOString(),
            history: [
                { date: '2024-01-01', status: 'Package picked up' },
                { date: '2024-01-02', status: 'In transit' },
                { date: '2024-01-03', status: 'Delivered' },
            ],
        };

        // Update item
        await supabase
            .from('bulk_tracking_items')
            .update({
                status: 'success',
                tracking_result: mockResult,
                processed_at: new Date().toISOString(),
            })
            .eq('id', itemId);

        // Update job progress
        const { data: item } = await supabase
            .from('bulk_tracking_items')
            .select('job_id')
            .eq('id', itemId)
            .single();

        if (item) {
            await supabase.rpc('update_job_progress', {
                p_job_id: item.job_id,
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error processing item:', error);

        // Mark as failed
        const supabase = await createClient();
        await supabase
            .from('bulk_tracking_items')
            .update({
                status: 'failed',
                error_message: error instanceof Error ? error.message : 'Unknown error',
                processed_at: new Date().toISOString(),
            })
            .eq('id', itemId);

        return { success: false, error: 'Processing failed' };
    }
}
