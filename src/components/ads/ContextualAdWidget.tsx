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
