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
