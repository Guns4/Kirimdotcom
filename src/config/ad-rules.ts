export type AdCampaign = {
    id: string; // Product ID or Slug
    triggerStatus: string[];
    headline: string;
    subheadline: string;
    cta: string;
    imageUrl?: string;
};

// These IDs should match real products in your DB ideally.
// For now we map to keywords that the component will use to search.

export const AD_RULES: AdCampaign[] = [
    {
        id: 'ebook-logistik', // Will search for this keyword
        triggerStatus: ['ON_PROCESS', 'MANIFESTED', 'TRANSIT', 'PENDING'],
        headline: 'Menunggu Paket Datang?',
        subheadline: 'Manfaatkan waktu tunggu dengan belajar sistem logistik professional.',
        cta: 'Baca E-Book Logistik',
        imageUrl: '/images/ads/ebook-ad.jpg'
    },
    {
        id: 'template-keuangan',
        triggerStatus: ['DELIVERED'],
        headline: 'Paket Sampai, Bisnis Lancar!',
        subheadline: 'Sekarang saatnya rapikan pembukuan agar profit makin jelas.',
        cta: 'Dapatkan Template Excel',
        imageUrl: '/images/ads/finance-ad.jpg'
    },
    {
        id: 'checklist-gudang',
        triggerStatus: ['RETURNING', 'RETURNED', 'ISSUE', 'LOST'],
        headline: 'Paket Bermasalah? Jangan Panik.',
        subheadline: 'Perbaiki SOP gudangmu dengan checklist operasional anti-retur.',
        cta: 'Download Checklist',
        imageUrl: '/images/ads/warehouse-ad.jpg'
    }
];

export function getAdForStatus(status: string): AdCampaign | null {
    const normalized = status.toUpperCase();
    return AD_RULES.find(rule => rule.triggerStatus.includes(normalized)) || AD_RULES[0]; // Fallback to first
}
