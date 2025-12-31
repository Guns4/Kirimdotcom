import axios, { AxiosInstance } from 'axios';

// ==========================================
// Binderbyte API Configuration
// ==========================================

const API_KEY = process.env.BINDERBYTE_API_KEY;
const BASE_URL = 'https://api.binderbyte.com/v1';

// ==========================================
// TypeScript Types & Interfaces
// ==========================================

export interface BinderbyteCostParams {
    origin: string;       // District/City code (e.g., "152" for Jakarta)
    destination: string;  // District/City code (e.g., "419" for Surabaya)
    weight: number;       // Weight in grams
    courier: string;      // Courier code: jne, pos, tiki, sicepat, jnt, anteraja
}

export interface BinderbyteTrackParams {
    courier: string;      // Courier code
    awb: string;          // Airway bill (tracking number)
}

export interface BinderbyteService {
    service_code: string;
    service_name: string;
    service_display: string;
    etd: string;          // Estimated delivery time (e.g., "2-3 HARI")
    price: number;
}

export interface BinderbyteCostResponse {
    status: number;
    message: string;
    data: {
        origin: string;
        destination: string;
        weight: number;
        courier: string;
        services: BinderbyteService[];
    };
}

export interface BinderbyteManifest {
    date: string;
    time: string;
    desc: string;
    location: string;
}

export interface BinderbyteTrackResponse {
    status: number;
    message: string;
    data: {
        waybill: string;
        courier: string;
        service: string;
        status: string;
        receiver: string | null;
        received_date: string | null;
        manifest: BinderbyteManifest[];
    };
}

// ==========================================
// Axios Client Instance
// ==========================================

export const binderbyteClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add API key to all requests
binderbyteClient.interceptors.request.use(
    (config) => {
        if (!API_KEY) {
            throw new Error('BINDERBYTE_API_KEY is not configured in environment variables');
        }

        config.params = {
            ...config.params,
            api_key: API_KEY,
        };

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================
// API Functions
// ==========================================

/**
 * Get shipping cost from Binderbyte API
 */
export async function getShippingCost(
    params: BinderbyteCostParams
): Promise<BinderbyteCostResponse> {
    try {
        const response = await binderbyteClient.get<BinderbyteCostResponse>('/cost', {
            params: {
                origin: params.origin,
                destination: params.destination,
                weight: params.weight,
                courier: params.courier,
            },
        });

        if (response.data.status !== 200) {
            throw new Error(response.data.message || 'Failed to get shipping cost');
        }

        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

/**
 * Track shipment from Binderbyte API
 */
export async function trackShipment(
    params: BinderbyteTrackParams
): Promise<BinderbyteTrackResponse> {
    try {
        const response = await binderbyteClient.get<BinderbyteTrackResponse>('/track', {
            params: {
                courier: params.courier,
                awb: params.awb,
            },
        });

        if (response.data.status !== 200) {
            throw new Error(response.data.message || 'Failed to track shipment');
        }

        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
}

// ==========================================
// Error Handling Utility
// ==========================================

export class BinderbyteError extends Error {
    public statusCode: number;
    public originalError?: any;

    constructor(message: string, statusCode: number = 500, originalError?: any) {
        super(message);
        this.name = 'BinderbyteError';
        this.statusCode = statusCode;
        this.originalError = originalError;
    }
}

/**
 * Standardized error handler for Binderbyte API
 */
export function handleApiError(error: any): BinderbyteError {
    console.error('[Binderbyte API Error]', error);

    if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Failed to communicate with shipping provider';

        // Handle specific error codes
        switch (status) {
            case 400:
                return new BinderbyteError('Invalid request parameters', 400, error);
            case 401:
                return new BinderbyteError('Invalid API key', 401, error);
            case 403:
                return new BinderbyteError('Access forbidden', 403, error);
            case 404:
                return new BinderbyteError('Resource not found', 404, error);
            case 429:
                return new BinderbyteError('Rate limit exceeded', 429, error);
            case 500:
            case 502:
            case 503:
                return new BinderbyteError('Shipping provider service unavailable', 503, error);
            default:
                return new BinderbyteError(message, status, error);
        }
    }

    // Non-Axios errors
    if (error instanceof Error) {
        return new BinderbyteError(error.message, 500, error);
    }

    return new BinderbyteError('Unknown error occurred', 500, error);
}

// ==========================================
// Validation Helpers
// ==========================================

/**
 * Validate Binderbyte cost parameters
 */
export function validateCostParams(params: BinderbyteCostParams): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!params.origin || typeof params.origin !== 'string') {
        errors.push('Origin is required and must be a string');
    }

    if (!params.destination || typeof params.destination !== 'string') {
        errors.push('Destination is required and must be a string');
    }

    if (!params.weight || params.weight <= 0) {
        errors.push('Weight must be greater than 0');
    }

    if (params.weight > 30000) {
        errors.push('Weight cannot exceed 30kg (30000 grams)');
    }

    if (!params.courier || typeof params.courier !== 'string') {
        errors.push('Courier is required and must be a string');
    }

    const validCouriers = ['jne', 'pos', 'tiki', 'sicepat', 'jnt', 'anteraja', 'wahana', 'ninja', 'lion'];
    if (params.courier && !validCouriers.includes(params.courier.toLowerCase())) {
        errors.push(`Invalid courier. Must be one of: ${validCouriers.join(', ')}`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate Binderbyte track parameters
 */
export function validateTrackParams(params: BinderbyteTrackParams): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!params.courier || typeof params.courier !== 'string') {
        errors.push('Courier is required and must be a string');
    }

    if (!params.awb || typeof params.awb !== 'string') {
        errors.push('AWB (tracking number) is required and must be a string');
    }

    if (params.awb && params.awb.length < 5) {
        errors.push('AWB must be at least 5 characters');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ==========================================
// Export All
// ==========================================

export default {
    getShippingCost,
    trackShipment,
    handleApiError,
    validateCostParams,
    validateTrackParams,
    binderbyteClient,
};
