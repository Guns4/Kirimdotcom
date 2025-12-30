// ============================================
// BINDERBYTE API SERVICE LAYER
// ============================================
// Handles all communication with BinderByte Logistics API

// BinderByte API Response Types
export interface BinderByteTrackingResponse {
  status: number;
  message: string;
  data?: {
    summary: {
      awb: string;
      courier: string;
      service: string;
      status: string;
      date: string;
      desc: string;
      amount: string;
      weight: string;
    };
    detail: string;
    history: Array<{
      date: string;
      desc: string;
      location: string;
    }>;
  };
}

export interface BinderByteCostResponse {
  status: number;
  message: string;
  data?: Array<{
    service: string;
    description: string;
    cost: Array<{
      value: number;
      etd: string;
      note: string;
    }>;
  }>;
}

// API Configuration
const BINDERBYTE_BASE_URL = 'https://api.binderbyte.com/v1';
const API_KEY = process.env.BINDERBYTE_API_KEY;

// Error handling helper
class LogisticsAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiMessage?: string
  ) {
    super(message);
    this.name = 'LogisticsAPIError';
  }
}

// ============================================
// TRACKING FUNCTIONS
// ============================================

/**
 * Track package by resi number
 * @param resiNumber - Tracking number
 * @param courierCode - Courier code (jne, jnt, sicepat, etc.)
 * @returns Tracking data or throws error
 */
export async function trackResi(
  resiNumber: string,
  courierCode: string
): Promise<BinderByteTrackingResponse> {
  if (!API_KEY) {
    throw new LogisticsAPIError(
      'API key not configured',
      500,
      'BINDERBYTE_API_KEY is missing in environment variables'
    );
  }

  try {
    const url = `${BINDERBYTE_BASE_URL}/track`;
    const params = new URLSearchParams({
      api_key: API_KEY,
      courier: courierCode.toLowerCase(),
      awb: resiNumber,
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes on CDN
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new LogisticsAPIError(
        'API request failed',
        response.status,
        `HTTP ${response.status}`
      );
    }

    const data: BinderByteTrackingResponse = await response.json();

    // Check if API returned error
    if (data.status !== 200) {
      throw new LogisticsAPIError(
        'Tracking failed',
        data.status,
        data.message || 'Unknown error from API'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof LogisticsAPIError) {
      throw error;
    }

    // Network or other errors
    throw new LogisticsAPIError(
      'Failed to connect to tracking service',
      0,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// ============================================
// SHIPPING COST FUNCTIONS
// ============================================

/**
 * Get shipping cost estimation
 * @param origin - Origin city/district ID
 * @param destination - Destination city/district ID
 * @param weight - Weight in grams
 * @param courierCode - Courier code (jne, jnt, pos, tiki, etc.)
 * @returns Cost data or throws error
 */
export async function getShippingCost(
  origin: string,
  destination: string,
  weight: number,
  courierCode: string,
  customKey?: string,
  accountType: string = 'starter'
): Promise<BinderByteCostResponse> {
  // 1. Custom Key Logic (Direct RajaOngkir)
  if (customKey) {
    try {
      const baseUrl =
        accountType === 'pro'
          ? 'https://pro.rajaongkir.com/api/cost'
          : 'https://api.rajaongkir.com/starter/cost';

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          key: customKey,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          origin,
          destination,
          weight: weight.toString(),
          courier: courierCode.toLowerCase(),
        }),
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        // Fallback to BinderByte if fail? No, user explicitly wanted custom key.
        throw new LogisticsAPIError(
          'Custom API Error',
          response.status,
          response.statusText
        );
      }

      const rawData = await response.json();
      const roResults = rawData.rajaongkir?.results?.[0]?.costs || [];

      // Map RajaOngkir to BinderByte Format since our app uses that structure
      const mappedData = roResults.map((service: any) => ({
        service: service.service,
        description: service.description,
        cost: service.cost.map((c: any) => ({
          value: c.value,
          etd: c.etd,
          note: c.note,
        })),
      }));

      return {
        status: 200,
        message: 'Success (Custom Key)',
        data: mappedData,
      };
    } catch (error) {
      console.error('RajaOngkir Custom Key Error:', error);
      // Don't fail completely, maybe return empty or throw specific
      throw new LogisticsAPIError('Gagal menggunakan Custom Key', 500);
    }
  }

  // 2. Default Logic (BinderByte)
  if (!API_KEY) {
    throw new LogisticsAPIError(
      'API key not configured',
      500,
      'BINDERBYTE_API_KEY is missing'
    );
  }

  try {
    const url = `${BINDERBYTE_BASE_URL}/cost`;
    const params = new URLSearchParams({
      api_key: API_KEY,
      courier: courierCode.toLowerCase(),
      origin: origin,
      destination: destination,
      weight: weight.toString(),
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 hour on CDN (ongkir stable)
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new LogisticsAPIError(
        'API request failed',
        response.status,
        `HTTP ${response.status}`
      );
    }

    const data: BinderByteCostResponse = await response.json();

    if (data.status !== 200) {
      throw new LogisticsAPIError(
        'Cost calculation failed',
        data.status,
        data.message || 'Unknown error from API'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof LogisticsAPIError) {
      throw error;
    }

    throw new LogisticsAPIError(
      'Failed to connect to shipping cost service',
      0,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if error is API limit exceeded
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof LogisticsAPIError) {
    return (
      error.statusCode === 429 || (error.apiMessage?.includes('limit') ?? false)
    );
  }
  return false;
}

/**
 * Check if error is "not found"
 */
export function isNotFoundError(error: unknown): boolean {
  if (error instanceof LogisticsAPIError) {
    return (
      error.statusCode === 404 ||
      (error.apiMessage?.toLowerCase().includes('not found') ?? false) ||
      (error.apiMessage?.toLowerCase().includes('tidak ditemukan') ?? false)
    );
  }
  return false;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof LogisticsAPIError) {
    if (isRateLimitError(error)) {
      return 'Sistem sedang sibuk. Silakan coba beberapa saat lagi.';
    }
    if (isNotFoundError(error)) {
      return 'Data tidak ditemukan. Periksa kembali nomor resi atau pilih kurir yang sesuai.';
    }
    return error.apiMessage || error.message;
  }

  return 'Terjadi kesalahan. Silakan coba lagi.';
}
