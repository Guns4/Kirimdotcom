'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Check rate limit for an identifier
 */
export async function checkRateLimit(
  identifier: string,
  identifierType: 'ip' | 'user' | 'api_key',
  endpoint: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error || !data || data.length === 0) {
      // If rate limit check fails, allow by default (fail open)
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: new Date(Date.now() + windowSeconds * 1000),
      };
    }

    const result = data[0];
    return {
      allowed: result.is_allowed,
      currentCount: result.current_count,
      remaining: result.remaining,
      resetAt: result.reset_at,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: 100, resetAt: new Date() };
  }
}

/**
 * Log audit event
 */
export async function logAudit(
  action: string,
  options?: {
    resourceType?: string;
    resourceId?: string;
    description?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    severity?: 'info' | 'warning' | 'critical';
  }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.rpc('log_audit', {
      p_user_id: user?.id || null,
      p_action: action,
      p_resource_type: options?.resourceType || null,
      p_resource_id: options?.resourceId || null,
      p_description: options?.description || null,
      p_old_values: options?.oldValues
        ? JSON.stringify(options.oldValues)
        : null,
      p_new_values: options?.newValues
        ? JSON.stringify(options.newValues)
        : null,
      p_ip_address: options?.ipAddress || null,
      p_severity: options?.severity || 'info',
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  eventType: string,
  ipAddress: string,
  description?: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  rawData?: any
) {
  try {
    const supabase = await createClient();

    await supabase.rpc('log_security_event', {
      p_event_type: eventType,
      p_ip_address: ipAddress,
      p_description: description || null,
      p_severity: severity,
      p_raw_data: rawData ? JSON.stringify(rawData) : null,
    });
  } catch (error) {
    console.error('Security event log error:', error);
  }
}

/**
 * Get audit logs (admin only)
 */
export async function getAuditLogs(
  filters?: {
    action?: string;
    userId?: string;
    severity?: string;
    fromDate?: string;
    toDate?: string;
  },
  limit: number = 100
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.fromDate) {
      query = query.gte('created_at', filters.fromDate);
    }
    if (filters?.toDate) {
      query = query.lte('created_at', filters.toDate);
    }

    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { data: null, error: 'Failed to fetch audit logs' };
  }
}

/**
 * Get security events (admin only)
 */
export async function getSecurityEvents(
  filters?: {
    eventType?: string;
    severity?: string;
    isResolved?: boolean;
  },
  limit: number = 100
) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.isResolved !== undefined) {
      query = query.eq('is_resolved', filters.isResolved);
    }

    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    console.error('Error fetching security events:', error);
    return { data: null, error: 'Failed to fetch security events' };
  }
}

/**
 * Resolve security event
 */
export async function resolveSecurityEvent(eventId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('security_events')
      .update({
        is_resolved: true,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      return { success: false, error: 'Failed to resolve event' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error resolving security event:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Create backup record
 */
export async function createBackupRecord(
  backupType: 'database' | 'storage' | 'full',
  notifyEmail?: string
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('backup_logs')
      .insert({
        backup_type: backupType,
        status: 'pending',
        notified_email: notifyEmail,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: 'Failed to create backup record' };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating backup record:', error);
    return { data: null, error: 'System error' };
  }
}

/**
 * Get backup logs
 */
export async function getBackupLogs(limit: number = 20) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('backup_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching backup logs:', error);
    return { data: null, error: 'Failed to fetch backup logs' };
  }
}
