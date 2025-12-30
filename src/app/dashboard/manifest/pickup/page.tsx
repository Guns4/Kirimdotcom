'use client';

// Force dynamic import for Leaflet component to avoid SSR errors
import dynamic from 'next/dynamic';
const PickupTracker = dynamic(
    () => import('@/components/logistics/PickupTracker').then(mod => mod.PickupTracker),
    { ssr: false, loading: () => <p className="p-10 text-center">Loading Map...</p> }
);

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { VipPickupButton } from '@/components/logistics/VipPickupButton'

export default function VipPickupPage() {
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard/manifest" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-2">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Manifest
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Live Tracking VIP Pickup</h1>
                        <p className="text-gray-500">Kurir prioritas sedang menuju lokasi Anda. Estimasi sampai: <span className="font-bold text-green-600">15 Menit</span>.</p>
                    </div>
                    {/* Debug button here just for easy access if coming directly */}
                    {/* <VipPickupButton /> */}
                </div>
            </div>

            <PickupTracker />

            <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-blue-900">Driver: Budi Santoso</h3>
                    <p className="text-sm text-blue-700">Honda Beat (B 1234 XYZ) • 4.9 ⭐</p>
                </div>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200 text-sm font-medium hover:bg-gray-50">
                    Hubungi Driver
                </button>
            </div>
        </div>
    );
}
