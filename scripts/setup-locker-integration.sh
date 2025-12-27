#!/bin/bash

# Setup Smart Locker Integration Module
echo "🚀 Setting up Smart Locker Integration..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_smart_locker.sql
CREATE TABLE IF NOT EXISTS locker_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    locker_provider TEXT NOT NULL, -- 'PaxelBox', 'PopBox', etc
    locker_location TEXT NOT NULL,
    locker_code TEXT, -- Access code/PIN
    locker_size TEXT NOT NULL, -- 'S', 'M', 'L'
    tracking_number TEXT,
    booking_time TIMESTAMPTZ DEFAULT NOW(),
    pickup_deadline TIMESTAMPTZ,
    status TEXT DEFAULT 'BOOKED', -- 'BOOKED', 'DROPPED', 'PICKED_UP', 'EXPIRED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE locker_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON locker_bookings FOR ALL USING (auth.uid() = user_id);
EOF

# 2. Create Locker Provider Mock API
echo "🔌 Creating Locker API Mock..."
mkdir -p src/lib/locker
cat << 'EOF' > src/lib/locker/locker-api.ts
// Mock API for Smart Locker Integration
// In production, this would integrate with actual provider APIs (PaxelBox, PopBox, etc.)

export interface LockerLocation {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
    available_sizes: ('S' | 'M' | 'L')[]
}

export interface BookingRequest {
    locationId: string
    size: 'S' | 'M' | 'L'
    trackingNumber?: string
}

export interface BookingResponse {
    success: boolean
    bookingId: string
    lockerCode: string
    address: string
    expiryTime: Date
}

export class SmartLockerAPI {
    private apiKey: string
    private baseUrl: string

    constructor(provider: 'PaxelBox' | 'PopBox' = 'PaxelBox') {
        this.apiKey = process.env.SMART_LOCKER_API_KEY || 'demo_key'
        this.baseUrl = provider === 'PaxelBox' 
            ? 'https://api.paxelbox.com/v1' 
            : 'https://api.popbox.id/v1'
    }

    async getNearbyLocations(latitude: number, longitude: number, radius: number = 5): Promise<LockerLocation[]> {
        // MOCK DATA - In production, call actual API
        return [
            {
                id: 'LOC001',
                name: 'PaxelBox - Mall Grand Indonesia',
                address: 'Jl. MH Thamrin No.1, Jakarta Pusat',
                latitude: -6.1944,
                longitude: 106.8229,
                available_sizes: ['S', 'M', 'L']
            },
            {
                id: 'LOC002',
                name: 'PaxelBox - Senayan City',
                address: 'Jl. Asia Afrika, Jakarta Selatan',
                latitude: -6.2253,
                longitude: 106.7997,
                available_sizes: ['S', 'M']
            },
            {
                id: 'LOC003',
                name: 'PaxelBox - Plaza Semanggi',
                address: 'Jl. Jend. Sudirman, Jakarta Selatan',
                latitude: -6.2214,
                longitude: 106.8083,
                available_sizes: ['M', 'L']
            }
        ]
    }

    async bookLocker(request: BookingRequest): Promise<BookingResponse> {
        // MOCK - Simulate API call
        const lockerCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        const expiryTime = new Date()
        expiryTime.setHours(expiryTime.getHours() + 24) // 24 hour expiry

        return {
            success: true,
            bookingId: `BK${Date.now()}`,
            lockerCode,
            address: 'Jl. MH Thamrin No.1, Jakarta Pusat',
            expiryTime
        }
    }

    async cancelBooking(bookingId: string): Promise<boolean> {
        // MOCK
        return true
    }

    async getBookingStatus(bookingId: string): Promise<string> {
        // MOCK
        return 'BOOKED'
    }
}
EOF

# 3. Create Server Actions
echo "⚡ Creating Locker Actions..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/locker.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import { SmartLockerAPI } from '@/lib/locker/locker-api'

export const getNearbyLockers = async (lat: number, lng: number) => {
    return safeAction(async () => {
        const lockerAPI = new SmartLockerAPI()
        const locations = await lockerAPI.getNearbyLocations(lat, lng)
        return locations
    })
}

export const bookLocker = async (locationId: string, size: 'S' | 'M' | 'L', trackingNumber?: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const lockerAPI = new SmartLockerAPI()
        const booking = await lockerAPI.bookLocker({ locationId, size, trackingNumber })

        if (!booking.success) throw new Error('Failed to book locker')

        // Save to database
        const { error } = await supabase.from('locker_bookings').insert({
            user_id: user.id,
            locker_provider: 'PaxelBox',
            locker_location: booking.address,
            locker_code: booking.lockerCode,
            locker_size: size,
            tracking_number: trackingNumber,
            pickup_deadline: booking.expiryTime.toISOString()
        })

        if (error) throw error

        return booking
    })
}

export const getMyBookings = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('locker_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}
EOF

# 4. Create Locker Booking UI
echo "🎨 Creating Locker Booking Interface..."
mkdir -p src/components/locker
cat << 'EOF' > src/components/locker/LockerBooking.tsx
'use client'

import { useState, useEffect } from 'react'
import { getNearbyLockers, bookLocker } from '@/app/actions/locker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Package, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export function LockerBooking() {
    const [locations, setLocations] = useState<any[]>([])
    const [selectedLocation, setSelectedLocation] = useState('')
    const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('M')
    const [trackingNumber, setTrackingNumber] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadNearbyLockers()
    }, [])

    const loadNearbyLockers = async () => {
        // Default Jakarta coordinates
        const result = await getNearbyLockers(-6.2088, 106.8456)
        if (result?.data) {
            setLocations(result.data)
        }
    }

    const handleBook = async () => {
        if (!selectedLocation) {
            toast.error('Pilih lokasi locker terlebih dahulu')
            return
        }

        setLoading(true)
        try {
            const result = await bookLocker(selectedLocation, selectedSize, trackingNumber || undefined)
            
            if (result?.success) {
                toast.success(`Locker berhasil dibooking! Kode: ${result.data.lockerCode}`, {
                    description: `Berlaku sampai ${new Date(result.data.expiryTime).toLocaleString()}`
                })
            }
        } catch (error: any) {
            toast.error(error.message || 'Gagal booking locker')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Book Smart Locker
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Pilih Lokasi</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih lokasi locker" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map(loc => (
                                <SelectItem key={loc.id} value={loc.id}>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {loc.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Ukuran Locker</label>
                    <Select value={selectedSize} onValueChange={(v: any) => setSelectedSize(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="S">Small (30x30cm)</SelectItem>
                            <SelectItem value="M">Medium (40x40cm)</SelectItem>
                            <SelectItem value="L">Large (50x50cm)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor Resi (Opsional)</label>
                    <Input 
                        placeholder="Masukkan nomor resi jika ada"
                        value={trackingNumber}
                        onChange={e => setTrackingNumber(e.target.value)}
                    />
                </div>

                <Button onClick={handleBook} disabled={loading} className="w-full">
                    Book Locker Sekarang
                </Button>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2 text-sm text-blue-700">
                        <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>Booking berlaku 24 jam. Kode akses akan dikirim via SMS.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
EOF

echo "✅ Smart Locker Integration Setup Complete!"
echo "📦 User dapat booking locker untuk drop paket dengan aman!"
echo "👉 Note: Membutuhkan API Key dari provider (PaxelBox/PopBox) untuk produksi."
