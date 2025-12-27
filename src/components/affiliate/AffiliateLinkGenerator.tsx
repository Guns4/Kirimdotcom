'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface AffiliateLinkGeneratorProps {
    productPath: string;
    affiliateCode: string;
    productName: string;
    commissionRate: number;
}

export default function AffiliateLinkGenerator({
    productPath,
    affiliateCode,
    productName,
    commissionRate,
}: AffiliateLinkGeneratorProps) {
    const [copied, setCopied] = useState(false);

    // Generate affiliate link
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://cekkirim.com';

    const affiliateLink = `${baseUrl}${productPath}?ref=${affiliateCode}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(affiliateLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Rekomendasi: ${productName}`,
                    text: `Cek produk digital ini! Cocok banget untuk seller online.`,
                    url: affiliateLink,
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Promosikan & Dapatkan Komisi</h3>
                    <p className="text-sm text-gray-600">
                        Dapatkan <span className="font-bold text-purple-600">{commissionRate}%</span> dari setiap penjualan
                    </p>
                </div>
            </div>

            {/* Affiliate Link Display */}
            <div className="bg-white rounded-lg border-2 border-purple-300 p-4 mb-4">
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                    Link Affiliate Anda:
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={affiliateLink}
                        readOnly
                        className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none"
                        onClick={(e) => e.currentTarget.select()}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleCopy}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            <span>Tersalin!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            <span>Salin Link</span>
                        </>
                    )}
                </button>

                <button
                    onClick={handleShare}
                    className="bg-white hover:bg-gray-50 text-purple-600 font-semibold py-3 px-4 rounded-lg border-2 border-purple-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan</span>
                </button>
            </div>

            {/* Info */}
            <div className="mt-4 bg-purple-100 rounded-lg p-3">
                <p className="text-xs text-purple-800">
                    💡 <span className="font-semibold">Tips:</span> Bagikan link ini ke teman, keluarga, atau follower media sosial Anda.
                    Setiap pembelian melalui link ini akan menghasilkan komisi untuk Anda!
                </p>
            </div>
        </div>
    );
}
