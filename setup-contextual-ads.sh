#!/bin/bash

# =============================================================================
# Monetization: Contextual Advertising Setup (Task 86)
# =============================================================================

echo "Initializing Contextual Ad Engine..."
echo "================================================="

# 1. Config: Keyword Mapping
echo "1. Creating Config: src/config/ad-keywords.json"
mkdir -p src/config

cat <<EOF > src/config/ad-keywords.json
{
  "mappings": [
    {
      "category": "Fashion",
      "keywords": ["baju", "kaos", "celana", "jaket", "sepatu", "tas", "dompet", "kemeja", "dress", "fashion"],
      "ad_title": "Lengkapi Gayamu!",
      "ad_image": "/ads/fashion-promo.jpg",
      "affiliate_link": "/shop/fashion"
    },
    {
      "category": "Gadget",
      "keywords": ["hp", "handphone", "case", "charger", "kabel", "headset", "earphone", "laptop", "mouse", "keyboard"],
      "ad_title": "Aksesoris Gadget Termurah",
      "ad_image": "/ads/gadget-promo.jpg",
      "affiliate_link": "/shop/gadget"
    },
    {
      "category": "Beauty",
      "keywords": ["skincare", "serum", "toner", "lipstik", "bedak", "cream", "masker", "kosmetik"],
      "ad_title": "Cantik Hemat Budget",
      "ad_image": "/ads/beauty-promo.jpg",
      "affiliate_link": "/shop/beauty"
    },
    {
      "category": "Home",
      "keywords": ["bantal", "sprei", "alat", "dapur", "sapu", "pel", "rak"],
      "ad_title": "Perkakas Rumah Diskon 50%",
      "ad_image": "/ads/home-promo.jpg",
      "affiliate_link": "/shop/home"
    },
    {
      "category": "Logistics",
      "keywords": ["dokumen", "surat", "kardus", "packing"],
      "ad_title": "Butuh Lakban & Plastik?",
      "ad_image": "/ads/logistics-promo.jpg",
      "affiliate_link": "/services/supplies"
    }
  ],
  "fallback": {
    "category": "General",
    "ad_title": "Promo Spesial Hari Ini",
    "ad_image": "/ads/general-promo.jpg",
    "affiliate_link": "/shop/flash-sale"
  }
}
EOF

# 2. Logic: Keyword Parser Utility
echo "2. Creating Logic: src/lib/ad-engine.ts"
cat <<EOF > src/lib/ad-engine.ts
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
EOF

# 3. Component: Contextual Ad Widget
echo "3. Creating Component: src/components/ads/ContextualAdWidget.tsx"
mkdir -p src/components/ads

cat <<EOF > src/components/ads/ContextualAdWidget.tsx
'use client';

import { useMemo } from 'react';
import { getContextualAd } from '@/lib/ad-engine';
import { ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ContextualAdWidgetProps {
    packageDescription: string;
}

export function ContextualAdWidget({ packageDescription }: ContextualAdWidgetProps) {
    const ad = useMemo(() => getContextualAd(packageDescription), [packageDescription]);

    if (!ad) return null;

    return (
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-100/50 rounded-full blur-xl group-hover:bg-blue-200/50 transition-colors" />

            <div className="relative z-10 flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                    {/* Placeholder Image Logic if real image fails */}
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-center text-gray-500 font-medium">
                        {ad.category}
                    </div>
                </div>
                
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            Sponsored
                        </span>
                        {ad.matchedKeyword && (
                             <span className="text-[10px] text-gray-500">
                                because you bought "{ad.matchedKeyword}"
                            </span>
                        )}
                    </div>
                    <h4 className="font-bold text-gray-900 leading-tight">{ad.title}</h4>
                    <Link href={ad.link} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                        Lihat Penawaran <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            <div className="relative z-10 hidden sm:block">
                 <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    Beli Sekarang
                 </button>
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Contextual Ads Setup Complete!"
echo "1. Import 'src/components/ads/ContextualAdWidget.tsx'."
echo "2. Place it in Tracking Result page: <ContextualAdWidget packageDescription={item.desc} />."
