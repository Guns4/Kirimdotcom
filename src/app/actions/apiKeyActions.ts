'use server';

import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';

/**
 * Generate new API key
 */
export async function generateAPIKey(keyName: string, isPaid: boolean = false) {
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

        const { data, error } = await supabase.rpc('generate_api_key', {
            p_user_id: user.id,
            p_key_name: keyName,
            p_is_paid: isPaid,
        });

        if (error || !data || data.length === 0) {
            console.error('Error generating API key:', error);
            return {
                success: false,
                error: 'Failed to generate API key',
            };
        }

        const result = data[0];

        return {
            success: true,
            apiKey: result.api_key,
            apiSecret: result.api_secret,
            message: 'API key generated successfully! Save the secret - it cannot be recovered.',
        };
    } catch (error) {
        console.error('Error in generateAPIKey:', error);
        return {
            success: false,
            error: 'System error',
        };
    }
}

/**
 * Get user's API keys
 */
export async function getUserAPIKeys() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('api_keys')
            .select('id, key_name, api_key, is_paid, is_active, rate_limit_per_day, total_requests, requests_today, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        console.error('Error fetching API keys:', error);
        return { data: null, error: 'Failed to fetch API keys' };
    }
}

/**
 * Revoke API key
 */
export async function revokeAPIKey(keyId: string) {
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

        const { error } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', keyId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error revoking API key:', error);
            return {
                success: false,
                error: 'Failed to revoke API key',
            };
        }

        return {
            success: true,
            message: 'API key revoked successfully',
        };
    } catch (error) {
        console.error('Error in revokeAPIKey:', error);
        return {
            success: false,
            error: 'System error',
        };
    }
}

/**
 * Get API usage statistics
 */
export async function getAPIUsageStats(keyId?: string) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        let query = supabase
            .from('api_usage_log')
            .select('*')
            .eq('user_id', user.id);

        if (keyId) {
            query = query.eq('api_key_id', keyId);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(100);

        return { data, error };
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        return { data: null, error: 'Failed to fetch usage stats' };
    }
}

/**
 * Validate API key (for API routes)
 */
export async function validateAPIKeyMiddleware(request: NextRequest) {
    const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!apiKey) {
        return {
            valid: false,
            status: 401,
            error: 'API key required. Include X-API-Key header.',
        };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc('validate_api_key', {
        p_api_key: apiKey,
    });

    if (error || !data || data.length === 0) {
        return {
            valid: false,
            status: 401,
            error: 'Invalid API key',
        };
    }

    const result = data[0];

    if (!result.is_valid) {
        return {
            valid: false,
            status: result.error_message.includes('Rate limit') ? 429 : 401,
            error: result.error_message,
        };
    }

    return {
        valid: true,
        userId: result.user_id,
        keyId: result.key_id,
        isPaid: result.is_paid,
        requestsRemaining: result.requests_remaining,
    };
}
