'use client';

import { ShoppingBag, Truck } from 'lucide-react';

interface Props {
    shopName?: string;
}

// Named export only (not default + re-export to avoid circular reference error)
export function MagicTrackingHeader({ shopName }: Props) {
    if (!shopName) return null; // Don't show if no shop name

    return (
        <div className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-xl">
            <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                        <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl md:text-2xl leading-none mb-1">
                            {shopName}
                        </h1>
                        <p className="text-indigo-100 text-sm font-medium flex items-center gap-1.5 opacity-90">
                            <Truck className="w-3 h-3" /> OFFICIAL TRACKING PAGE
                        </p>
                    </div>
                </div>

                <div className="text-xs font-medium bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                    Powered by CekKirim Technology
                </div>
            </div>
        </div>
    );
}

// Default export for backward compatibility
export default MagicTrackingHeader;
