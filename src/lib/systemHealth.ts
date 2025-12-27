import { createServerClient } from '@/utils/supabase/server';

/**
 * System Health Monitor
 * Error logging, API status, and maintenance mode
 */

// ============================================
// Error Logging
// ============================================

interface ErrorLog {
    error_type: string;
    message: string;
    stack?: string;
    url?: string;
    user_id?: string;
    user_agent?: string;
    ip_address?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Log error to Supabase error_logs table
 */
export async function logError(error: ErrorLog): Promise<void> {
    try {
        const supabase = await createServerClient();

        await supabase.from('error_logs').insert({
            ...error,
            created_at: new Date().toISOString(),
        });
    } catch (e) {
        // Fallback to console if DB fails
        console.error('[ERROR LOG FAILED]', error, e);
    }
}

/**
 * Log 500 error with request context
 */
export async function log500Error(
    error: Error,
    request?: Request,
    userId?: string
): Promise<void> {
    await logError({
        error_type: '500_SERVER_ERROR',
        message: error.message,
        stack: error.stack,
        url: request?.url,
        user_id: userId,
        user_agent: request?.headers.get('user-agent') || undefined,
        ip_address: request?.headers.get('x-forwarded-for') || undefined,
    });
}

// ============================================
// API Status Check
// ============================================

interface APIStatus {
    name: string;
    url: string;
    status: 'up' | 'down' | 'degraded';
    responseTime: number;
    lastChecked: Date;
    error?: string;
}

/**
 * Check if an API endpoint is healthy
 */
export async function checkAPIHealth(name: string, url: string, timeout = 5000): Promise<APIStatus> {
    const start = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseTime = Date.now() - start;

        return {
            name,
            url,
            status: response.ok ? (responseTime > 2000 ? 'degraded' : 'up') : 'down',
            responseTime,
            lastChecked: new Date(),
        };
    } catch (error) {
        return {
            name,
            url,
            status: 'down',
            responseTime: Date.now() - start,
            lastChecked: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Check all critical APIs
 */
export async function checkAllAPIs(): Promise<APIStatus[]> {
    const apis = [
        { name: 'BinderByte', url: 'https://api.binderbyte.com/v1/ping' },
        { name: 'Supabase', url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/` },
    ];

    const results = await Promise.all(
        apis.map(({ name, url }) => checkAPIHealth(name, url))
    );

    return results;
}

/**
 * Check database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        const supabase = await createServerClient();
        const { error } = await supabase.from('profiles').select('id').limit(1);
        return !error;
    } catch {
        return false;
    }
}

// ============================================
// Maintenance Mode
// ============================================

const MAINTENANCE_KEY = 'site_maintenance_mode';

/**
 * Check if site is in maintenance mode
 */
export async function isMaintenanceMode(): Promise<boolean> {
    try {
        const supabase = await createServerClient();
        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', MAINTENANCE_KEY)
            .single();

        return data?.value === 'true';
    } catch {
        return false;
    }
}

/**
 * Toggle maintenance mode
 */
export async function setMaintenanceMode(enabled: boolean): Promise<boolean> {
    try {
        const supabase = await createServerClient();

        await supabase
            .from('site_settings')
            .upsert({
                key: MAINTENANCE_KEY,
                value: enabled ? 'true' : 'false',
                updated_at: new Date().toISOString(),
            });

        return true;
    } catch {
        return false;
    }
}

/**
 * Get maintenance status with message
 */
export async function getMaintenanceInfo(): Promise<{
    enabled: boolean;
    message?: string;
    estimatedEnd?: string;
}> {
    try {
        const supabase = await createServerClient();
        const { data } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', [MAINTENANCE_KEY, 'maintenance_message', 'maintenance_end']);

        const settings = Object.fromEntries(data?.map(d => [d.key, d.value]) || []);

        return {
            enabled: settings[MAINTENANCE_KEY] === 'true',
            message: settings.maintenance_message,
            estimatedEnd: settings.maintenance_end,
        };
    } catch {
        return { enabled: false };
    }
}

// ============================================
// Health Check Summary
// ============================================

export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'down';
    database: boolean;
    apis: APIStatus[];
    maintenance: boolean;
    timestamp: Date;
}

/**
 * Get overall system health
 */
export async function getSystemHealth(): Promise<SystemHealth> {
    const [database, apis, maintenance] = await Promise.all([
        checkDatabaseHealth(),
        checkAllAPIs(),
        isMaintenanceMode(),
    ]);

    const apiStatuses = apis.map(a => a.status);
    const hasDown = apiStatuses.includes('down') || !database;
    const hasDegraded = apiStatuses.includes('degraded');

    return {
        status: hasDown ? 'down' : (hasDegraded ? 'degraded' : 'healthy'),
        database,
        apis,
        maintenance,
        timestamp: new Date(),
    };
}

export default {
    logError,
    log500Error,
    checkAPIHealth,
    checkAllAPIs,
    checkDatabaseHealth,
    isMaintenanceMode,
    setMaintenanceMode,
    getMaintenanceInfo,
    getSystemHealth,
};
