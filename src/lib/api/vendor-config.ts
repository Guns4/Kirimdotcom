// Vendor API Configuration
// Centralized config for RajaOngkir, Binderbyte, Digiflazz

export const VENDOR_CONFIG = {
  // Shipping API (RajaOngkir/Binderbyte)
  SHIPPING_API_KEY: process.env.RAJAONGKIR_API_KEY || process.env.BINDERBYTE_API_KEY || '',
  SHIPPING_BASE_URL: process.env.RAJAONGKIR_API_KEY 
    ? 'https://pro.rajaongkir.com/api'
    : 'https://api.binderbyte.com/v1',
  SHIPPING_PROVIDER: process.env.RAJAONGKIR_API_KEY ? 'rajaongkir' : 'binderbyte',

  // PPOB API (Digiflazz/Tripay)
  PPOB_USER: process.env.DIGIFLAZZ_USERNAME || '',
  PPOB_KEY: process.env.DIGIFLAZZ_API_KEY || '',
  PPOB_BASE_URL: 'https://api.digiflazz.com/v1',

  // Pricing
  SHIPPING_MARKUP: 1000, // Rp 1.000 profit per shipping
  PPOB_MARGIN_PERCENT: 5, // 5% profit margin for PPOB
  
  // Cache TTL
  CACHE_TTL_DAYS: 30,
};

// Validation helper
export function validateVendorConfig() {
  const errors: string[] = [];

  if (!VENDOR_CONFIG.SHIPPING_API_KEY) {
    errors.push('Missing RAJAONGKIR_API_KEY or BINDERBYTE_API_KEY');
  }

  if (!VENDOR_CONFIG.PPOB_USER || !VENDOR_CONFIG.PPOB_KEY) {
    errors.push('Missing DIGIFLAZZ credentials (DIGIFLAZZ_USERNAME, DIGIFLAZZ_API_KEY)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
