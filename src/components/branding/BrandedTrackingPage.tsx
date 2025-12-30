'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Clock, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    getBrandingByShopId,
    generateCSSVariables,
    DEFAULT_BRANDING,
    type ShopBranding
} from '@/lib/shop-branding';

interface BrandedTrackingPageProps {
    resi?: string;
    trackingData?: {
        courier: string;
        status: string;
        lastUpdate: string;
        history: { date: string; status: string; location: string }[];
    };
}

export default function BrandedTrackingPage({ resi, trackingData }: BrandedTrackingPageProps) {
    const searchParams = useSearchParams();
    const shopId = searchParams.get('shop_id');
    const [branding, setBranding] = useState<Partial<ShopBranding>>(DEFAULT_BRANDING);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBranding() {
            if (shopId) {
                const data = await getBrandingByShopId(shopId);
                if (data) {
                    setBranding(data);
                }
            }
            setLoading(false);
        }
        loadBranding();
    }, [shopId]);

    const cssVars = generateCSSVariables(branding);
    const isPro = branding.subscriptionStatus === 'BRANDING_PRO';

    // Mock tracking data
    const mockTracking = trackingData || {
        courier: 'JNE',
        status: 'Paket dalam perjalanan',
        lastUpdate: '31 Des 2024, 10:30',
        history: [
            { date: '31 Des 10:30', status: 'Paket dalam perjalanan ke kota tujuan', location: 'Hub Jakarta' },
            { date: '30 Des 15:00', status: 'Paket dikirim dari gudang', location: 'Warehouse Tangerang' },
            { date: '30 Des 09:00', status: 'Paket diproses', location: 'Seller Location' },
        ]
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div
            className="min-h-screen"
            style={{
                ...cssVars as React.CSSProperties,
                backgroundColor: branding.backgroundColor,
                color: branding.textColor
            }}
        >
            {/* Header */}
            <div
                className="py-6 px-4"
                style={{ backgroundColor: branding.primaryColor }}
            >
                <div className="max-w-2xl mx-auto text-center text-white">
                    {branding.logoUrl && isPro ? (
                        <img
                            src={branding.logoUrl}
                            alt={branding.shopName}
                            className="h-12 mx-auto mb-2"
                        />
                    ) : (
                        <h1 className="text-2xl font-bold">{branding.shopName || 'CekKirim'}</h1>
                    )}
                    {branding.tagline && <p className="text-sm opacity-90">{branding.tagline}</p>}
                </div>
            </div>

            {/* Ad Banner (if Pro) */}
            {isPro && branding.adBannerUrl && (
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <a href={branding.adBannerLink || '#'} target="_blank" rel="noopener">
                        <img
                            src={branding.adBannerUrl}
                            alt="Promo"
                            className="w-full rounded-lg shadow-md"
                        />
                    </a>
                </div>
            )}

            {/* Tracking Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Resi Info */}
                <Card className="mb-6">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">Nomor Resi</div>
                                <div className="text-xl font-bold">{resi || 'JP1234567890'}</div>
                            </div>
                            <div
                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: branding.secondaryColor }}
                            >
                                {mockTracking.courier}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status */}
                <Card className="mb-6" style={{ borderColor: branding.primaryColor, borderWidth: 2 }}>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: branding.primaryColor }}
                            >
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="font-bold">{mockTracking.status}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {mockTracking.lastUpdate}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* History */}
                <Card>
                    <CardContent className="py-4">
                        <h3 className="font-bold mb-4">Riwayat Pengiriman</h3>
                        <div className="space-y-4">
                            {mockTracking.history.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full mt-1.5"
                                        style={{ backgroundColor: idx === 0 ? branding.primaryColor : '#D1D5DB' }}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{item.status}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <span>{item.date}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {item.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Buttons */}
                {(branding.whatsappNumber || branding.instagramHandle) && (
                    <div className="mt-6 flex gap-3">
                        {branding.whatsappNumber && (
                            <Button
                                className="flex-1"
                                style={{ backgroundColor: '#25D366' }}
                                asChild
                            >
                                <a href={`https://wa.me/${branding.whatsappNumber}`} target="_blank">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </a>
                            </Button>
                        )}
                        {branding.instagramHandle && (
                            <Button
                                className="flex-1"
                                style={{ backgroundColor: '#E4405F' }}
                                asChild
                            >
                                <a href={`https://instagram.com/${branding.instagramHandle.replace('@', '')}`} target="_blank">
                                    Instagram
                                </a>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center py-6 text-sm text-gray-400">
                {isPro ? branding.footerText : 'Powered by CekKirim.com'}
            </div>
        </div>
    );
}
