'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface PremiumLockProps {
    feature: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function PremiumLock({ feature, children, fallback }: PremiumLockProps) {
    const [isPremium, setIsPremium] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkPremiumStatus();
    }, []);

    const checkPremiumStatus = async () => {
        try {
            const response = await fetch('/api/check-premium');
            const data = await response.json();
            setIsPremium(data.isPremium);
        } catch (error) {
            console.error('Error checking premium status:', error);
            setIsPremium(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        );
    }

    if (!isPremium) {
        return fallback || (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Fitur Premium 👑
                </h3>
                <p className="text-gray-700 mb-6">
                    <strong>{feature}</strong> hanya tersedia untuk member Premium.
                    Upgrade sekarang untuk unlock fitur ini!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/pricing"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 py-3 rounded-lg transition-colors"
                    >
                        Lihat Paket Premium
                    </Link>
                    <Link
                        href="/"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-8 py-3 rounded-lg transition-colors"
                    >
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
