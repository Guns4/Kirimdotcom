#!/bin/bash

# =============================================================================
# Premium Service: VIP Pickup Setup (Task 84)
# =============================================================================

echo "Initializing VIP Pickup Service..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: vip_pickup_schema.sql"
cat <<EOF > vip_pickup_schema.sql
-- Pickup Requests Table
CREATE TABLE IF NOT EXISTS public.pickup_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    courier_id UUID REFERENCES auth.users(id), -- Courier is also a user type
    status TEXT DEFAULT 'PENDING', -- PENDING, ASSIGNED, ON_THE_WAY, COMPLETED, CANCELLED
    pickup_address TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(10, 8),
    fee DECIMAL(19,4) DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courier Live Locations (for tracking)
CREATE TABLE IF NOT EXISTS public.courier_locations (
    courier_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    lat DECIMAL(10, 8),
    lng DECIMAL(10, 8),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE
);

-- Seed Dummy Courier (for demo)
-- Ideally this would be a real user, but we insert a location for a dummy UUID
-- Note: Dispatcher logic will look for this.
EOF

# 2. API Route (Request & Dispatcher)
echo "2. Creating API: src/app/api/logistics/pickup/request/route.ts"
mkdir -p src/app/api/logistics/pickup/request

cat <<EOF > src/app/api/logistics/pickup/request/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { lat, lng, address } = body;

    // 1. Check Wallet Balance & Deduct Fee (Rp 10.000)
    // (Assuming generic ledger check passed, simpler for demo: just record debt/payment)
    const FEE = 10000;
    
    // 2. Dispatcher Logic: Find nearest courier < 5km
    // formula: Haversine or Postgres PostGIS. Using simple Euclidean for small distances/demo or mocked.
    
    // MOCK: Find any 'online' courier. Real app would use:
    // SELECT * FROM courier_locations WHERE ST_DWithin(...)
    
    const { data: couriers } = await supabase
        .from('courier_locations')
        .select('*')
        .eq('is_online', true)
        .limit(1);

    let assignedCourierId = null;
    let status = 'PENDING';

    if (couriers && couriers.length > 0) {
        assignedCourierId = couriers[0].courier_id;
        status = 'ASSIGNED';
    } else {
        // DUMMY FALLBACK for Demo if no DB couriers
        // assignedCourierId = '00000000-0000-0000-0000-000000000000'; 
        // status = 'ASSIGNED';
    }

    // 3. Create Request
    const { data: pickup, error } = await supabase.from('pickup_requests').insert({
        user_id: user.id,
        courier_id: assignedCourierId,
        status,
        lat, 
        lng,
        pickup_address: address,
        fee: FEE
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 4. Charge Wallet
    await supabase.from('ledger_entries').insert({
        user_id: user.id,
        amount: -FEE,
        type: 'SERVICE_FEE',
        description: 'Biaya VIP Pickup Paket'
    });

    return NextResponse.json({ success: true, pickup });
}
EOF

# 3. UI Components
echo "3. Creating Components..."
mkdir -p src/components/logistics

# VIP Request Button
cat <<EOF > src/components/logistics/VipPickupButton.tsx
'use client';

import { useState } from 'react';
import { Rocket, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function VipPickupButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleRequest() {
        if (!confirm('Request VIP Pickup sekarang? Biaya Rp 10.000 akan dipotong.')) return;
        
        setLoading(true);
        try {
            // Mock Location (Jakarta Pusat)
            const mockLocation = { lat: -6.175110, lng: 106.865036, address: 'Gudang Utama' };

            const res = await fetch('/api/logistics/pickup/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockLocation)
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success('VIP Pickup Requested!');
                router.push('/dashboard/manifest/pickup'); // Redirect to tracker
            } else {
                toast.error('Gagal: ' + data.error);
            }
        } catch (e) {
            toast.error('Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    }

    return (
        <button 
            onClick={handleRequest}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 font-semibold"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            VIP Pickup (+10rb)
        </button>
    );
}
EOF

# Pickup Tracker Maps (Leaflet)
# Note: Leaflet requires window check for SSR
cat <<EOF > src/components/logistics/PickupTracker.tsx
'use client';

import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet Icons in Next.js
const iconPerson = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // User
    iconSize: [40, 40],
    iconAnchor: [20, 20], // Center
});

const iconCourier = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2640/2640751.png', // Courier data:image/svg...
    iconSize: [45, 45],
    iconAnchor: [22, 22],
});

export function PickupTracker() {
    const [courierPos, setCourierPos] = useState<[number, number]>([-6.1755, 106.8275]); // Monas default
    const [userPos] = useState<[number, number]>([-6.175110, 106.865036]); // Cempaka/Gudang

    // Simulating Live Movement
    useEffect(() => {
        const interval = setInterval(() => {
            setCourierPos(prev => [
                prev[0] + (Math.random() - 0.5) * 0.001, // Move slightly
                prev[1] + (Math.random() - 0.5) * 0.001
            ]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // SSR Check
    if (typeof window === 'undefined') return null;

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
            <MapContainer center={userPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                />
                
                <Marker position={userPos} icon={iconPerson}>
                    <Popup>Lokasi Anda (Penjemputan)</Popup>
                </Marker>

                <Marker position={courierPos} icon={iconCourier}>
                    <Popup>Kurir VIP (Sedang Menuju Lokasi)</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
EOF

# 4. Page Wrapper
echo "4. Creating Page: src/app/dashboard/manifest/pickup/page.tsx"
mkdir -p src/app/dashboard/manifest/pickup

cat <<EOF > src/app/dashboard/manifest/pickup/page.tsx
'use client';

// Force dynamic import for Leaflet component to avoid SSR errors
import dynamic from 'next/dynamic';
const PickupTracker = dynamic(
    () => import('@/components/logistics/PickupTracker').then(mod => mod.PickupTracker),
    { ssr: false, loading: () => <p className="p-10 text-center">Loading Map...</p> }
);

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VipPickupPage() {
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard/manifest" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-2">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Manifest
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Live Tracking VIP Pickup</h1>
                <p className="text-gray-500">Kurir prioritas sedang menuju lokasi Anda. Estimasi sampai: <span className="font-bold text-green-600">15 Menit</span>.</p>
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
EOF

echo ""
echo "================================================="
echo "VIP Pickup Setup Complete!"
echo "1. Run 'vip_pickup_schema.sql'."
echo "2. Add <VipPickupButton /> to Manifest Page."
