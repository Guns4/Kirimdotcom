#!/bin/bash

# =============================================================================
# Smart Advertising: Contextual Ad System
# =============================================================================

echo "Initializing Smart Ad System..."
echo "================================================="

# 1. Config: Ad Rules
echo "1. Creating Ad Rules: src/config/ad-rules.ts"
mkdir -p src/config
cat <<EOF > src/config/ad-rules.ts
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
EOF

# 2. Component: Contextual Banner
echo "2. Creating Component: src/components/ads/ContextualAdBanner.tsx"
mkdir -p src/components/ads
cat <<EOF > src/components/ads/ContextualAdBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAdForStatus, AdCampaign } from '@/config/ad-rules';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export function ContextualAdBanner({ status }: { status: string }) {
  const [ad, setAd] = useState<AdCampaign | null>(null);
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    const campaign = getAdForStatus(status);
    setAd(campaign);

    if (campaign) {
       // Search real product data based on ID keyword
       const fetchProduct = async () => {
         const supabase = createClient();
         const { data } = await supabase
            .from('digital_products')
            .select('*')
            .ilike('file_url', \`%\${campaign.id}%\`) // Searching file_url or title for keyword
            .single();
         
         if (data) setProductData(data);
       };
       fetchProduct();
    }
  }, [status]);

  if (!ad) return null;

  return (
    <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative shadow-xl my-6">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
       
       <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Icon / Image Area */}
          <div className="flex-shrink-0">
             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                 <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
             </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-center sm:text-left">
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-yellow-300 mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Rekomendasi CekKirim</span>
             </div>
             <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
                {ad.headline}
             </h3>
             <p className="text-slate-300 text-sm mb-4 max-w-xl">
                {ad.subheadline}
             </p>
             
             {productData && (
                 <div className="mb-4 text-sm font-bold text-green-400">
                    Harga: Rp {productData.price.toLocaleString('id-ID')}
                 </div>
             )}

             <Link href={productData ? \`/shop/product/\${productData.id}\` : '/shop'}>
                <Button size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-primary/25">
                   {ad.cta} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
             </Link>
          </div>
       </div>
    </Card>
  );
}
EOF

echo ""
echo "================================================="
echo "Smart Ad System Ready!"
echo "1. Ad Rules configured in 'src/config/ad-rules.ts'."
echo "2. Banner component created in 'src/components/ads/ContextualAdBanner.tsx'."
echo "3. Usage: <ContextualAdBanner status={tracker.status} />"
