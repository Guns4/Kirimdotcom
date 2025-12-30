import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CekKirim - Cek Resi & Ongkir Semua Ekspedisi Indonesia',
  description:
    'Platform terlengkap untuk cek resi paket dan ongkir termurah semua ekspedisi: JNE, J&T, SiCepat, AnterAja, Ninja Xpress, POS Indonesia. Gratis & Akurat!',
  keywords:
    'cek resi, tracking paket, cek ongkir, ongkir termurah, JNE tracking, J&T tracking, SiCepat, lacak paket, cek tarif kirim, ekspedisi Indonesia',
  authors: [{ name: 'CekKirim.com' }],
  creator: 'CekKirim.com',
  publisher: 'CekKirim.com',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://www.cekkirim.com',
    title: 'CekKirim - Cek Resi & Ongkir Semua Ekspedisi',
    description:
      'Cek resi paket dan ongkir termurah semua ekspedisi Indonesia. JNE, J&T, SiCepat, AnterAja & lebih banyak lagi!',
    siteName: 'CekKirim',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CekKirim - Cek Resi & Ongkir',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CekKirim - Cek Resi & Ongkir Semua Ekspedisi',
    description:
      'Platform terlengkap untuk cek resi dan ongkir termurah semua ekspedisi Indonesia',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.cekkirim.com',
  },
  verification: {
    google: 'your-google-verification-code', // TODO: Add from Google Search Console
  },
};

// JSON-LD Structured Data
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CekKirim',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    description:
      'Platform untuk mengecek resi paket dan tarif ongkir semua ekspedisi Indonesia',
    url: 'https://www.cekkirim.com',
    image: 'https://www.cekkirim.com/og-image.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    featureList: [
      'Cek Resi Semua Ekspedisi',
      'Cek Ongkir Termurah',
      'Tracking Real-time',
      'Riwayat Pencarian',
      'AI Insights',
    ],
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CekKirim',
    url: 'https://www.cekkirim.com',
    logo: 'https://www.cekkirim.com/logo.png',
    description: 'Platform terpercaya untuk cek resi dan ongkir di Indonesia',
    sameAs: [
      // TODO: Add social media links
      'https://facebook.com/cekkirim',
      'https://twitter.com/cekkirim',
      'https://instagram.com/cekkirim',
    ],
  };
}
