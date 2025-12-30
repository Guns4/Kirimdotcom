'use server';

import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

// ============================================
// API KEY MANAGEMENT SERVER ACTIONS
// ============================================

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  requests_count: number;
  requests_limit: number;
  scopes: string[];
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

// Generate a new API key
export async function generateApiKey(name: string): Promise<{
  success: boolean;
  error?: string;
  apiKey?: string; // Full key (only shown once)
  keyData?: ApiKey;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Tidak terautentikasi' };
  }

  // Check existing keys count (limit to 5)
  const { count } = await (supabase as any)
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if ((count || 0) >= 5) {
    return { success: false, error: 'Maksimal 5 API key aktif' };
  }

  // Generate secure random key
  const keyBytes = crypto.randomBytes(32);
  const rawKey = `ck_live_${keyBytes.toString('hex')}`;
  const keyPrefix = rawKey.substring(0, 16);

  // Hash the key for storage
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

  // Save to database
  const { data, error } = await (supabase as any)
    .from('api_keys')
    .insert({
      user_id: user.id,
      name: name || 'Default Key',
      key_hash: keyHash,
      key_prefix: keyPrefix,
      requests_limit: 1000, // Default quota
      scopes: ['track:read', 'ongkir:read'],
    })
    .select(
      'id, name, key_prefix, requests_count, requests_limit, scopes, is_active, created_at'
    )
    .single();

  if (error) {
    console.error('Failed to create API key:', error);
    return { success: false, error: 'Gagal membuat API key' };
  }

  return {
    success: true,
    apiKey: rawKey, // Only returned once!
    keyData: data,
  };
}

// Get user's API keys
export async function getApiKeys(): Promise<ApiKey[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await (supabase as any)
    .from('api_keys')
    .select(
      'id, name, key_prefix, requests_count, requests_limit, scopes, is_active, last_used_at, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get API keys:', error);
    return [];
  }

  return data || [];
}

// Delete/Revoke an API key
export async function revokeApiKey(
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Tidak terautentikasi' };
  }

  const { error } = await (supabase as any)
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', user.id);

  if (error) {
    return { success: false, error: 'Gagal menonaktifkan API key' };
  }

  return { success: true };
}

// Get API key usage stats
export async function getApiKeyStats(keyId: string): Promise<{
  totalRequests: number;
  todayRequests: number;
  recentLogs: any[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalRequests: 0, todayRequests: 0, recentLogs: [] };
  }

  // Get recent logs
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: logs } = await (supabase as any)
    .from('api_request_logs')
    .select('*')
    .eq('api_key_id', keyId)
    .order('created_at', { ascending: false })
    .limit(50);

  const todayLogs = (logs || []).filter(
    (log: any) => new Date(log.created_at) >= today
  );

  return {
    totalRequests: logs?.length || 0,
    todayRequests: todayLogs.length,
    recentLogs: logs || [],
  };
}

// Validate API key (for internal use)
export async function validateApiKeyServer(apiKey: string): Promise<{
  valid: boolean;
  error?: string;
  userId?: string;
  keyId?: string;
  remainingQuota?: number;
}> {
  const supabase = await createClient();

  // Hash the incoming key
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Find and validate
  const { data, error } = await (supabase as any)
    .from('api_keys')
    .select(
      'id, user_id, requests_count, requests_limit, is_active, expires_at'
    )
    .eq('key_hash', keyHash)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (!data.is_active) {
    return { valid: false, error: 'API key is revoked' };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: 'API key expired' };
  }

  if (data.requests_count >= data.requests_limit) {
    return { valid: false, error: 'Monthly quota exceeded' };
  }

  // Increment usage
  await (supabase as any)
    .from('api_keys')
    .update({
      requests_count: data.requests_count + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', data.id);

  return {
    valid: true,
    userId: data.user_id,
    keyId: data.id,
    remainingQuota: data.requests_limit - data.requests_count - 1,
  };
}
