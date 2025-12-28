/**
 * Rich Snippets - JSON-LD Schema Components
 * For CTR optimization in Google search results
 */

interface FAQItem {
    question: string;
    answer: string;
}

interface ReviewData {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
}

interface ProductSchemaProps {
    name: string;
    description: string;
    price: number;
    currency?: string;
    image?: string;
    review?: ReviewData;
}

interface ServiceSchemaProps {
    name: string;
    description: string;
    provider: string;
    areaServed?: string;
    review?: ReviewData;
}

/**
 * Product Schema - For PPOB/Pulsa pages
 */
export function ProductSchema({ name, description, price, currency = 'IDR', image, review }: ProductSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: image || 'https://cekkirim.com/logo.png',
        offers: {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: 'CekKirim',
            },
        },
        ...(review && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: review.ratingValue,
                reviewCount: review.reviewCount,
                bestRating: review.bestRating || 5,
            },
        }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Service Schema - For Cek Resi/Cek Ongkir pages
 */
export function ServiceSchema({ name, description, provider, areaServed = 'ID', review }: ServiceSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        provider: {
            '@type': 'Organization',
            name: provider,
            url: 'https://cekkirim.com',
        },
        areaServed: {
            '@type': 'Country',
            name: areaServed,
        },
        ...(review && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: review.ratingValue,
                reviewCount: review.reviewCount,
                bestRating: review.bestRating || 5,
            },
        }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * FAQ Schema - For FAQ sections
 */
export function FAQSchema({ items }: { items: FAQItem[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Organization Schema - For branding
 */
export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CekKirim',
        url: 'https://cekkirim.com',
        logo: 'https://cekkirim.com/logo.png',
        description: 'Platform cek ongkir dan tracking paket terlengkap di Indonesia',
        sameAs: [
            'https://www.instagram.com/cekkirim',
            'https://twitter.com/cekkirim',
            'https://www.facebook.com/cekkirim',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: 'Indonesian',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Website Schema with SearchAction
 */
export function WebsiteSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'CekKirim',
        url: 'https://cekkirim.com',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://cekkirim.com/cek-resi?resi={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Breadcrumb Schema
 */
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Review Schema Helper
 * Creates a 4.8/5.0 rating for CTR optimization
 */
export const DEFAULT_REVIEW: ReviewData = {
    ratingValue: 4.8,
    reviewCount: 12847,
    bestRating: 5,
};

/**
 * Pre-built FAQ items for common questions
 */
export const COMMON_FAQS: FAQItem[] = [
    {
        question: 'Berapa lama pengiriman JNE Reguler?',
        answer: 'Pengiriman JNE Reguler biasanya memakan waktu 2-4 hari kerja tergantung jarak antara kota asal dan tujuan.',
    },
    {
        question: 'Berapa ongkir termurah untuk 1 kg?',
        answer: 'Ongkir termurah untuk 1 kg mulai dari Rp 8.000 menggunakan layanan ekonomi. Harga dapat berbeda tergantung rute pengiriman.',
    },
    {
        question: 'Bagaimana cara cek resi pengiriman?',
        answer: 'Masukkan nomor resi di halaman Cek Resi CekKirim.com, pilih kurir yang sesuai, lalu klik Lacak untuk melihat status terbaru.',
    },
    {
        question: 'Ekspedisi apa yang paling cepat?',
        answer: 'Layanan tercepat adalah Same Day (hari yang sama) dan Next Day dari kurir seperti GoSend, GrabExpress, JNE YES, dan SiCepat BEST.',
    },
    {
        question: 'Apakah CekKirim gratis?',
        answer: 'Ya, layanan cek ongkir dan tracking di CekKirim 100% gratis tanpa biaya apapun.',
    },
];

export default {
    ProductSchema,
    ServiceSchema,
    FAQSchema,
    OrganizationSchema,
    WebsiteSchema,
    BreadcrumbSchema,
    DEFAULT_REVIEW,
    COMMON_FAQS,
};
