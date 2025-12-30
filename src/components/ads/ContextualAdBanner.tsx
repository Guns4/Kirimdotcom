'use client';

import { useEffect, useState } from 'react';
import { getAdForStatus, AdCampaign } from '@/config/ad-rules';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface DigitalProduct {
    id: string;
    title: string;
    price: number;
    file_url: string;
}

export function ContextualAdBanner({ status }: { status: string }) {
    const [ad, setAd] = useState<AdCampaign | null>(null);
    const [productData, setProductData] = useState<DigitalProduct | null>(null);

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
                    .ilike('file_url', `%${campaign.id}%`) // Searching file_url or title for keyword
                    .single();

                if (data) setProductData(data as DigitalProduct);
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

                    <Link href={productData ? `/shop/product/${productData.id}` : '/shop'}>
                        <Button size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-primary/25">
                            {ad.cta} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}
