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
