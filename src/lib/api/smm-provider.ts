import axios, { AxiosInstance } from 'axios';

// ==========================================
// SMM Provider Configuration
// ==========================================

interface SmmConfig {
    BASE_URL: string;
    API_ID: string;
    API_KEY: string;
    PROVIDER_NAME: string;
}

const SMM_CONFIG: SmmConfig = {
    BASE_URL: process.env.SMM_PROVIDER_URL || 'https://medanpedia.co.id/api',
    API_ID: process.env.SMM_API_ID || '',
    API_KEY: process.env.SMM_API_KEY || '',
    PROVIDER_NAME: process.env.SMM_PROVIDER_NAME || 'MedanPedia',
};

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface SmmOrderRequest {
    service_id: string;   // Service ID from provider
    target: string;       // Instagram username, TikTok URL, etc.
    qty: number;          // Quantity
}

export interface SmmOrderResponse {
    success: boolean;
    provider_order_id?: string;
    start_count?: number;
    remains?: number;
    note?: string;
    error?: string;
}

export interface SmmServiceStatus {
    order_id: string;
    status: string;       // Pending, Processing, Completed, Failed
    start_count?: number;
    remains?: number;
    charge?: number;
}

// ==========================================
// Axios Client for SMM Provider
// ==========================================

const smmClient: AxiosInstance = axios.create({
    baseURL: SMM_CONFIG.BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
});

// ==========================================
// Main Functions
// ==========================================

/**
 * Process SMM Order
 * Send order to SMM provider (MedanPedia, IrvanKede, JAP, etc.)
 */
export async function processSmmOrder(
    orderData: SmmOrderRequest
): Promise<SmmOrderResponse> {
    try {
        console.log('[SMM Provider] Processing order...', {
            service_id: orderData.service_id,
            target: orderData.target,
            qty: orderData.qty,
            provider: SMM_CONFIG.PROVIDER_NAME,
        });

        // Validate configuration
        if (!SMM_CONFIG.API_ID || !SMM_CONFIG.API_KEY) {
            throw new Error('SMM provider credentials not configured');
        }

        // Validate input
        if (!orderData.service_id || !orderData.target || !orderData.qty) {
            throw new Error('Missing required fields: service_id, target, qty');
        }

        // Prepare payload (standard JAP/SmartPanel format)
        const payload = new URLSearchParams();
        payload.append('api_id', SMM_CONFIG.API_ID);
        payload.append('api_key', SMM_CONFIG.API_KEY);
        payload.append('service', orderData.service_id);
        payload.append('target', orderData.target);
        payload.append('quantity', orderData.qty.toString());

        console.log('[SMM Provider] Sending request to:', SMM_CONFIG.BASE_URL);

        // Send request to provider
        const response = await smmClient.post('/order', payload);
        const result = response.data;

        console.log('[SMM Provider] Response received:', result);

        // Handle success response
        // Most providers return: { status: true, data: { id: '12345', ... } }
        if (result.status === true || result.data?.id || result.data?.order_id) {
            const orderId = result.data?.id || result.data?.order_id || result.order_id;

            console.log('[SMM Provider] ✅ Order placed successfully:', orderId);

            return {
                success: true,
                provider_order_id: orderId,
                start_count: result.data?.start_count,
                remains: result.data?.remains,
                note: result.data?.message || 'Order successfully sent to provider',
            };
        }

        // Handle failure response
        const errorMsg = result.data?.message || result.message || 'Unknown provider error';
        console.error('[SMM Provider] ❌ Order failed:', errorMsg);

        return {
            success: false,
            error: errorMsg,
        };

    } catch (error: any) {
        console.error('[SMM Provider] Exception:', error);

        // Axios error
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;

            return {
                success: false,
                error: `Provider API error (${status}): ${message}`,
            };
        }

        // Generic error
        return {
            success: false,
            error: error.message || 'Failed to process SMM order',
        };
    }
}

/**
 * Check order status from SMM provider
 */
export async function checkSmmOrderStatus(
    providerOrderId: string
): Promise<SmmServiceStatus | null> {
    try {
        console.log('[SMM Provider] Checking order status:', providerOrderId);

        const payload = new URLSearchParams();
        payload.append('api_id', SMM_CONFIG.API_ID);
        payload.append('api_key', SMM_CONFIG.API_KEY);
        payload.append('order_id', providerOrderId);

        const response = await smmClient.post('/status', payload);
        const result = response.data;

        if (result.status === true && result.data) {
            return {
                order_id: result.data.id || providerOrderId,
                status: result.data.status || 'Unknown',
                start_count: result.data.start_count,
                remains: result.data.remains,
                charge: result.data.charge,
            };
        }

        return null;
    } catch (error: any) {
        console.error('[SMM Provider] Failed to check status:', error.message);
        return null;
    }
}

/**
 * Get available services from provider
 */
export async function getSmmServices(): Promise<any[]> {
    try {
        console.log('[SMM Provider] Fetching services list...');

        const payload = new URLSearchParams();
        payload.append('api_id', SMM_CONFIG.API_ID);
        payload.append('api_key', SMM_CONFIG.API_KEY);

        const response = await smmClient.post('/services', payload);
        const result = response.data;

        if (result.status === true && Array.isArray(result.data)) {
            console.log(`[SMM Provider] Found ${result.data.length} services`);
            return result.data;
        }

        return [];
    } catch (error: any) {
        console.error('[SMM Provider] Failed to fetch services:', error.message);
        return [];
    }
}

/**
 * Check provider balance
 */
export async function checkSmmBalance(): Promise<number | null> {
    try {
        console.log('[SMM Provider] Checking balance...');

        const payload = new URLSearchParams();
        payload.append('api_id', SMM_CONFIG.API_ID);
        payload.append('api_key', SMM_CONFIG.API_KEY);

        const response = await smmClient.post('/balance', payload);
        const result = response.data;

        if (result.status === true && result.data?.balance !== undefined) {
            const balance = parseFloat(result.data.balance);
            console.log('[SMM Provider] Balance:', balance);
            return balance;
        }

        return null;
    } catch (error: any) {
        console.error('[SMM Provider] Failed to check balance:', error.message);
        return null;
    }
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Validate SMM configuration
 */
export function validateSmmConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!SMM_CONFIG.BASE_URL) {
        errors.push('SMM_PROVIDER_URL is not configured');
    }

    if (!SMM_CONFIG.API_ID) {
        errors.push('SMM_API_ID is not configured');
    }

    if (!SMM_CONFIG.API_KEY) {
        errors.push('SMM_API_KEY is not configured');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Extract username from Instagram/TikTok URL
 */
export function extractUsername(url: string): string {
    // Remove @ if present
    let username = url.replace('@', '');

    // Extract from full URL
    // https://instagram.com/username → username
    // https://www.tiktok.com/@username → username
    const match = username.match(/(?:instagram\.com|tiktok\.com)\/@?([a-zA-Z0-9._]+)/);
    if (match) {
        return match[1];
    }

    // Already a username
    return username;
}

// ==========================================
// Export All
// ==========================================

export default {
    processSmmOrder,
    checkSmmOrderStatus,
    getSmmServices,
    checkSmmBalance,
    validateSmmConfig,
    extractUsername,
    SMM_CONFIG,
};
