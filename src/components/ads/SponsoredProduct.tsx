'use client';

import { useState } from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface SponsoredProductProps {
    bidId: string;
    sellerId: string;
    productName: string;
    productImage?: string;
    price: number;
    link: string;
}

export function SponsoredProduct({ bidId, sellerId, productName, productImage, price, link }: SponsoredProductProps) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        // Record Click & Audit Billing asynchronously
        // We don't block navigation, but we fire the request
        fetch('/api/ads/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidId, sellerId })
        });

        // Navigate
        window.open(link, '_blank');
    }

    return (
        <div
            onClick={handleClick}
            className="group cursor-pointer border-2 border-amber-400 bg-amber-50/50 rounded-xl p-3 relative hover:shadow-lg transition-all"
        >
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded tracking-wide">
                Ad
            </div>

            <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-lg border border-amber-200 flex items-center justify-center text-xs text-center overflow-hidden">
                    {productImage ? <img src={productImage} alt={productName} className="object-cover" /> : 'Product'}
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {productName}
                    </h5>
                    <p className="text-sm font-semibold text-gray-700">
                        Rp {price.toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-700">
                        <Megaphone className="w-3 h-3" />
                        <span>Sponsored</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
