import React from 'react';

// --- Constants ---

export const DEFAULT_REVIEW = {
  ratingValue: '4.8',
  reviewCount: '12847',
  bestRating: '5',
  worstRating: '1',
};

export const COMMON_FAQS = [
  {
    question: 'Bagaimana cara cek resi semua ekspedisi?',
    answer:
      'Cukup masukkan nomor resi dari JNE, J&T, SiCepat, atau ekspedisi lain ke kolom tracking di CekKirim.com, lalu klik "Cek Resi". Status paket akan muncul otomatis dalam hitungan detik.',
  },
  {
    question: 'Apakah cek ongkir di CekKirim akurat?',
    answer:
      'Ya, data ongkir kami diambil langsung dari sistem ekspedisi resmi dan diupdate secara berkala (real-time) untuk memastikan keakuratan harga.',
  },
  {
    question: 'Apa saja ekspedisi yang didukung?',
    answer:
      'Kami mendukung pengecekan resi dan ongkir untuk JNE, J&T, SiCepat, Anteraja, Pos Indonesia, Lion Parcel, Ninja Xpress, ID Express, dan banyak lagi.',
  },
];

// --- Components ---

type BaseSchemaProps = {
  data: Record<string, any>;
};

const JsonLdScript = ({ data }: BaseSchemaProps) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

export const ProductSchema = ({
  name,
  description,
  price,
  currency = 'IDR',
  review = DEFAULT_REVIEW,
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  review?: typeof DEFAULT_REVIEW;
}) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: review.ratingValue,
      reviewCount: review.reviewCount,
      bestRating: review.bestRating,
      worstRating: review.worstRating,
    },
  };
  return <JsonLdScript data={data} />;
};

export const ServiceSchema = ({
  name,
  description,
  provider,
  review = DEFAULT_REVIEW,
}: {
  name: string;
  description: string;
  provider: string;
  review?: typeof DEFAULT_REVIEW;
}) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: review.ratingValue,
      reviewCount: review.reviewCount,
      bestRating: review.bestRating,
      worstRating: review.worstRating,
    },
  };
  return <JsonLdScript data={data} />;
};

export const FAQSchema = ({
  items,
}: {
  items: { question: string; answer: string }[];
}) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  return <JsonLdScript data={data} />;
};

export const OrganizationSchema = ({
  name,
  url,
  logo,
  sameAs = [],
}: {
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
}) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    sameAs,
  };
  return <JsonLdScript data={data} />;
};

export const WebsiteSchema = ({
  name,
  url,
  searchUrl, // e.g., 'https://cekkirim.com/search?q={search_term_string}'
}: {
  name: string;
  url: string;
  searchUrl?: string;
}) => {
  const data: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
  };

  if (searchUrl) {
    data.potentialAction = {
      '@type': 'SearchAction',
      target: searchUrl,
      'query-input': 'required name=search_term_string',
    };
  }

  return <JsonLdScript data={data} />;
};

export const BreadcrumbSchema = ({
  items,
}: {
  items: { name: string; url: string }[];
}) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLdScript data={data} />;
};
