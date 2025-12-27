#!/bin/bash

# Setup Fleet Management GPS Tracking Module
echo "🚀 Setting up Fleet Management (GPS Tracking)..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_fleet.sql
CREATE TABLE IF NOT EXISTS fleet_vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_name TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    driver_name TEXT,
    driver_phone TEXT,
    device_id TEXT, -- GPS tracker device ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plate_number)
);

CREATE TABLE IF NOT EXISTS fleet_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    speed NUMERIC DEFAULT 0, -- km/h
    heading NUMERIC DEFAULT 0, -- degrees
    accuracy NUMERIC DEFAULT 0, -- meters
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fleet_locations_vehicle ON fleet_locations(vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fleet_locations_time ON fleet_locations(timestamp);

-- RLS
ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own vehicles" ON fleet_vehicles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own vehicle locations" ON fleet_locations 
    FOR SELECT USING (EXISTS (SELECT 1 FROM fleet_vehicles WHERE id = vehicle_id AND user_id = auth.uid()));
EOF

# 2. Create Server Actions
echo "⚡ Creating Fleet Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/fleet.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

export const getFleetVehicles = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('fleet_vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

    return data || []
}

export const getVehicleLocation = async (vehicleId: string) => {
    return safeAction(async () => {
        const supabase = await createClient()

        // Get last 10 locations for route history
        const { data } = await supabase
            .from('fleet_locations')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('timestamp', { ascending: false })
            .limit(10)

        return data || []
    })
}

export const updateVehicleLocation = async (vehicleId: string, location: {
    latitude: number
    longitude: number
    speed?: number
    heading?: number
    accuracy?: number
}) => {
    return safeAction(async () => {
        const supabase = await createClient()

        const { error } = await supabase.from('fleet_locations').insert({
            vehicle_id: vehicleId,
            ...location
        })

        if (error) throw error
        return { success: true }
    })
}
EOF

# 3. Create Fleet Map Component
echo "🗺️ Creating Fleet Tracker UI..."
mkdir -p src/components/fleet
cat << 'EOF' > src/components/fleet/FleetMap.tsx
'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getFleetVehicles, getVehicleLocation } from '@/app/actions/fleet'
import { Card } from '@/components/ui/card'

// Fix Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
    iconUrl: '/images/leaflet/marker-icon.png',
    shadowUrl: '/images/leaflet/marker-shadow.png',
});

export function FleetMap() {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [locations, setLocations] = useState<Record<string, any[]>>({})

    useEffect(() => {
        loadFleet()
        const interval = setInterval(loadFleet, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const loadFleet = async () => {
        const vehicleData = await getFleetVehicles()
        setVehicles(vehicleData)

        // Load locations for each vehicle
        for (const vehicle of vehicleData) {
            const locs = await getVehicleLocation(vehicle.id)
            if (locs?.data) {
                setLocations(prev => ({ ...prev, [vehicle.id]: locs.data }))
            }
        }
    }

    if (vehicles.length === 0) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">Belum ada kendaraan terdaftar dalam fleet</p>
            </Card>
        )
    }

    // Default center (Indonesia)
    const center: [number, number] = [-6.2088, 106.8456]

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border">
            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {vehicles.map(vehicle => {
                    const locs = locations[vehicle.id] || []
                    if (locs.length === 0) return null

                    const latest = locs[0]
                    const position: [number, number] = [Number(latest.latitude), Number(latest.longitude)]
                    const route = locs.map(l => [Number(l.latitude), Number(l.longitude)] as [number, number])

                    return (
                        <div key={vehicle.id}>
                            <Marker position={position}>
                                <Popup>
                                    <div className="text-sm">
                                        <p className="font-bold">{vehicle.vehicle_name}</p>
                                        <p className="text-xs text-gray-500">{vehicle.plate_number}</p>
                                        <p className="text-xs">Driver: {vehicle.driver_name}</p>
                                        <p className="text-xs">Speed: {latest.speed || 0} km/h</p>
                                    </div>
                                </Popup>
                            </Marker>
                            <Polyline positions={route} color="#4f46e5" weight={3} opacity={0.6} />
                        </div>
                    )
                })}
            </MapContainer>
        </div>
    )
}
EOF

# 4. Create GPS Tracker Client (for driver's phone)
echo "📱 Creating GPS Sender for Driver App..."
cat << 'EOF' > src/app/driver-tracker/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation, Square } from 'lucide-react'
import { updateVehicleLocation } from '@/app/actions/fleet'
import { toast } from 'sonner'

export default function DriverTrackerPage() {
    const [tracking, setTracking] = useState(false)
    const [watchId, setWatchId] = useState<number | null>(null)
    const vehicleId = '00000000-0000-0000-0000-000000000000' // TODO: Get from auth/session

    const startTracking = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation tidak didukung di browser ini')
            return
        }

        const id = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude, speed, heading, accuracy } = position.coords

                await updateVehicleLocation(vehicleId, {
                    latitude,
                    longitude,
                    speed: speed || 0,
                    heading: heading || 0,
                    accuracy: accuracy || 0
                })
            },
            (error) => {
                console.error('GPS Error:', error)
                toast.error('Gagal mendapatkan lokasi GPS')
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        )

        setWatchId(id)
        setTracking(true)
        toast.success('GPS tracking aktif')
    }

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
            setWatchId(null)
        }
        setTracking(false)
        toast.info('GPS tracking dihentikan')
    }

    useEffect(() => {
        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId)
            }
        }
    }, [watchId])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Driver GPS Tracker</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!tracking ? (
                        <Button onClick={startTracking} className="w-full gap-2 bg-green-600 hover:bg-green-700">
                            <Navigation className="w-4 h-4" />
                            Mulai Tracking
                        </Button>
                    ) : (
                        <Button onClick={stopTracking} variant="destructive" className="w-full gap-2">
                            <Square className="w-4 h-4" />
                            Berhenti Tracking
                        </Button>
                    )}

                    <p className="text-xs text-center text-muted-foreground">
                        {tracking ? 'Lokasi Anda sedang dilacak dan dikirim ke server setiap 5 detik' : 'Tekan tombol untuk mulai mengirim lokasi GPS'}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
EOF

echo "✅ Fleet Management Setup Complete!"
echo "🚗 Owner dapat melacak kurir mereka secara realtime di peta!"
