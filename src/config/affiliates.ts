// ============================================
// COURIER AFFILIATE CONFIGURATION
// ============================================
// Contains affiliate URLs and monetization config for each courier

export interface CourierAffiliateConfig {
  code: string;
  name: string;
  logo: string;
  // Affiliate settings
  affiliateUrl?: string;
  affiliateType: 'official' | 'marketplace' | 'ads' | 'none';
  // Action button config
  actionLabel: string;
  actionEnabled: boolean;
  // Tracking
  trackClicks: boolean;
}

export const courierAffiliateConfig: Record<string, CourierAffiliateConfig> = {
  jne: {
    code: 'jne',
    name: 'JNE',
    logo: '/couriers/jne.png',
    affiliateUrl: 'https://www.jne.co.id/id/tracking/trace',
    affiliateType: 'official',
    actionLabel: 'Kunjungi JNE',
    actionEnabled: true,
    trackClicks: true,
  },
  jnt: {
    code: 'jnt',
    name: 'J&T Express',
    logo: '/couriers/jnt.png',
    affiliateUrl: 'https://www.jet.co.id/track',
    affiliateType: 'official',
    actionLabel: 'Kunjungi J&T',
    actionEnabled: true,
    trackClicks: true,
  },
  sicepat: {
    code: 'sicepat',
    name: 'SiCepat',
    logo: '/couriers/sicepat.png',
    affiliateUrl: 'https://www.sicepat.com/checkAwb',
    affiliateType: 'official',
    actionLabel: 'Kunjungi SiCepat',
    actionEnabled: true,
    trackClicks: true,
  },
  anteraja: {
    code: 'anteraja',
    name: 'AnterAja',
    logo: '/couriers/anteraja.png',
    affiliateUrl: 'https://anteraja.id/tracking',
    affiliateType: 'official',
    actionLabel: 'Kunjungi AnterAja',
    actionEnabled: true,
    trackClicks: true,
  },
  ninja: {
    code: 'ninja',
    name: 'Ninja Xpress',
    logo: '/couriers/ninja.png',
    affiliateUrl: 'https://www.ninjaxpress.co/id-id/tracking',
    affiliateType: 'official',
    actionLabel: 'Kunjungi Ninja',
    actionEnabled: true,
    trackClicks: true,
  },
  pos: {
    code: 'pos',
    name: 'POS Indonesia',
    logo: '/couriers/pos.png',
    affiliateUrl: 'https://www.posindonesia.co.id/id/tracking',
    affiliateType: 'official',
    actionLabel: 'Kunjungi POS',
    actionEnabled: true,
    trackClicks: true,
  },
  tiki: {
    code: 'tiki',
    name: 'TIKI',
    logo: '/couriers/tiki.png',
    affiliateUrl: 'https://www.tiki.id/id/tracking',
    affiliateType: 'official',
    actionLabel: 'Kunjungi TIKI',
    actionEnabled: true,
    trackClicks: true,
  },
};

// Get affiliate config for a courier
export function getCourierAffiliateConfig(
  courierCode: string
): CourierAffiliateConfig | null {
  return courierAffiliateConfig[courierCode.toLowerCase()] || null;
}

// Get all couriers with affiliate links
export function getAffiliateCouriers(): CourierAffiliateConfig[] {
  return Object.values(courierAffiliateConfig).filter((c) => c.actionEnabled);
}

// ============================================
// MARKETPLACE AFFILIATE LINKS
// ============================================
// For "Pesan Sekarang" buttons that link to marketplaces

export interface MarketplaceAffiliate {
  name: string;
  url: string;
  logo: string;
  tagline: string;
}

export const marketplaceAffiliates: MarketplaceAffiliate[] = [
  {
    name: 'Tokopedia',
    url: 'https://www.tokopedia.com/discover/gratis-ongkir',
    logo: '/affiliates/tokopedia.png',
    tagline: 'Gratis Ongkir',
  },
  {
    name: 'Shopee',
    url: 'https://shopee.co.id/m/gratis-ongkir',
    logo: '/affiliates/shopee.png',
    tagline: 'Free Shipping',
  },
  {
    name: 'Blibli',
    url: 'https://www.blibli.com/promosi/gratis-ongkir',
    logo: '/affiliates/blibli.png',
    tagline: 'Gratis Ongkir',
  },
];
