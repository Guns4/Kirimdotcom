'use client';

import { Check, Sparkles } from 'lucide-react';

interface BundleItem {
    type: string;
    name: string;
    value: number;
}

interface BundlePricingCardProps {
    bundleName: string;
    description: string;
    originalPrice: number;
    bundlePrice: number;
    discountPercentage: number;
    items: BundleItem[];
    features: string[];
    badgeText?: string;
    onPurchase: () => void;
}

export default function BundlePricingCard({
    bundleName,
    description,
    originalPrice,
    bundlePrice,
    discountPercentage,
    features,
    badgeText,
    onPurchase,
}: BundlePricingCardProps) {
    const savings = originalPrice - bundlePrice;

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-500 max-w-lg mx-auto">
            {/* Badge */}
            {badgeText && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {badgeText}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{bundleName}</h3>
                <p className="text-gray-600">{description}</p>
            </div>

            {/* Pricing */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <span className="text-2xl text-gray-400 line-through">
                        {formatRupiah(originalPrice)}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        HEMAT {discountPercentage}%
                    </span>
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                    {formatRupiah(bundlePrice)}
                </div>
                <p className="text-green-600 font-semibold">
                    💰 Anda Hemat: {formatRupiah(savings)}
                </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                            <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                    </div>
                ))}
            </div>

            {/* CTA Button */}
            <button
                onClick={onPurchase}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                🚀 Beli Sekarang & Mulai Jualan!
            </button>

            {/* Guarantee */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    ✅ Garansi 7 Hari Uang Kembali | 🔒 Pembayaran Aman
                </p>
            </div>
        </div>
    );
}
