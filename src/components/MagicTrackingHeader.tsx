'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Package, ExternalLink, Store } from 'lucide-react';

interface MagicTrackingHeaderProps {
    courier: string;
    trackingNumber: string;
}

/**
 * B2B2C Magic Tracking Header
 * Displays custom branding when shop_name parameter is present
 */
export function MagicTrackingHeader({ courier, trackingNumber }: MagicTrackingHeaderProps) {
    const searchParams = useSearchParams();
    const shopName = searchParams.get('shop_name');

    if (!shopName) {
        // Default header
        return (
            <div className="bg-gradient-to-r from-primary-600 to-accent-500 text-white p-6 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                    <Package className="w-8 h-8" />
                    <div>
                        <h1 className="text-2xl font-bold">Tracking Paket</h1>
                        <p className="text-white/80">{courier.toUpperCase()} • {trackingNumber}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Custom branded header for B2B2C
    return (
        <div className="bg-gradient-to-r from-surface-800 to-surface-900 text-white p-6 rounded-xl mb-6 border border-surface-700">
            <div className="flex items-center gap-3 mb-4">
                <Store className="w-8 h-8 text-accent-400" />
                <div>
                    <h1 className="text-2xl font-bold">Tracking Paket untuk Customer</h1>
                    <p className="text-xl text-accent-400 font-semibold">{shopName}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
                <Package className="w-4 h-4" />
                <span>{courier.toUpperCase()} • {trackingNumber}</span>
            </div>
        </div>
    );
}

/**
 * CekKirim Ad Slot
 * Shows promotion for CekKirim services
 */
export function CekKirimAdSlot() {
    const searchParams = useSearchParams();
    const shopName = searchParams.get('shop_name');

    // Only show ad when viewing from seller's branded link
    if (!shopName) return null;

    return (
        <div className="mt-6 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-surface-900 mb-1">
                        Mau kirim paket murah juga?
                    </h3>
                    <p className="text-sm text-surface-600 mb-3">
                        Bandingkan harga dari 10+ ekspedisi dan hemat ongkir hingga 50%!
                    </p>
                    <Link
                        href="/?ref=magic-tracking"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
                    >
                        <span>Cek di CekKirim</span>
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default MagicTrackingHeader;
