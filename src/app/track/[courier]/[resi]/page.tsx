import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { MagicTrackingHeader, CekKirimAdSlot } from '@/components/MagicTrackingHeader';
import { ShareableCard } from '@/components/ShareableCard';

interface PageProps {
    params: Promise<{
        courier: string;
        resi: string;
    }>;
    searchParams: Promise<{
        shop_name?: string;
    }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
    const { courier, resi } = await params;
    const { shop_name } = await searchParams;

    const title = shop_name
        ? `Tracking Paket ${shop_name} - ${courier.toUpperCase()}`
        : `Tracking ${courier.toUpperCase()} - ${resi}`;

    return {
        title,
        description: `Lacak status pengiriman ${courier.toUpperCase()} dengan resi ${resi}. Tracking real-time gratis di CekKirim.`,
        robots: shop_name ? 'noindex' : 'index, follow',
    };
}

export default async function MagicTrackingPage({ params, searchParams }: PageProps) {
    const { courier, resi } = await params;
    const { shop_name } = await searchParams;

    // Validate courier
    const validCouriers = ['jne', 'jnt', 'sicepat', 'anteraja', 'pos', 'tiki', 'ninja', 'wahana', 'lion', 'idx'];
    if (!validCouriers.includes(courier.toLowerCase())) {
        notFound();
    }

    // Mock tracking data - in production, fetch from API
    const trackingData = {
        status: 'DELIVERED',
        courier: courier.toUpperCase(),
        trackingNumber: resi,
        deliveryDays: 2,
        origin: 'Jakarta',
        destination: 'Bandung',
    };

    return (
        <main className="min-h-screen bg-surface-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Branded Header */}
                <Suspense fallback={<div className="h-24 bg-surface-200 animate-pulse rounded-xl mb-6" />}>
                    <MagicTrackingHeader
                        courier={trackingData.courier}
                        trackingNumber={trackingData.trackingNumber}
                    />
                </Suspense>

                {/* Tracking Status */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">
                            {trackingData.status === 'DELIVERED' ? '✅' : '🚚'}
                        </div>
                        <h2 className="text-3xl font-bold text-surface-900 mb-2">
                            {trackingData.status}
                        </h2>
                        <p className="text-surface-600">
                            Estimasi pengiriman: {trackingData.deliveryDays} hari
                        </p>
                        {trackingData.origin && trackingData.destination && (
                            <p className="text-sm text-surface-500 mt-2">
                                {trackingData.origin} → {trackingData.destination}
                            </p>
                        )}
                    </div>
                </div>

                {/* Shareable Card */}
                <div className="mb-6">
                    <h3 className="font-semibold text-surface-900 mb-3">Bagikan Status</h3>
                    <ShareableCard
                        trackingNumber={trackingData.trackingNumber}
                        courier={trackingData.courier}
                        status={trackingData.status}
                        deliveryDays={trackingData.deliveryDays}
                        origin={trackingData.origin}
                        destination={trackingData.destination}
                    />
                </div>

                {/* CekKirim Ad Slot (only shows for branded links) */}
                <Suspense fallback={null}>
                    <CekKirimAdSlot />
                </Suspense>

                {/* Footer */}
                <div className="text-center text-sm text-surface-500 mt-8">
                    <p>Powered by CekKirim.com</p>
                    <p className="mt-1">Cek ongkir & tracking gratis!</p>
                </div>
            </div>
        </main>
    );
}
