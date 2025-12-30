import adConfig from '@/config/ad-keywords.json';

type AdConfig = typeof adConfig;
type AdMapping = AdConfig['mappings'][0];

export interface AdResult {
    category: string;
    title: string;
    image: string;
    link: string;
    matchedKeyword?: string;
}

export function getContextualAd(packageDescription: string): AdResult {
    if (!packageDescription) return mapToAd(adConfig.fallback);

    const lowerDesc = packageDescription.toLowerCase();

    // Find first matching category
    const match = adConfig.mappings.find(mapping =>
        mapping.keywords.some(keyword => lowerDesc.includes(keyword))
    );

    if (match) {
        // Find specific keyword that matched for analytics (optional)
        const matchedKw = match.keywords.find(k => lowerDesc.includes(k));
        return {
            ...mapToAd(match),
            matchedKeyword: matchedKw
        };
    }

    return mapToAd(adConfig.fallback);
}

function mapToAd(mapping: any): AdResult {
    return {
        category: mapping.category,
        title: mapping.ad_title,
        image: mapping.ad_image,
        link: mapping.affiliate_link
    };
}
