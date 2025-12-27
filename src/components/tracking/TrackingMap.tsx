'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
// import { useEffect, useState } from 'react' // Not used in this version

// Fix Leaflet Default Icon Import
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
    iconUrl: '/images/leaflet/marker-icon.png',
    shadowUrl: '/images/leaflet/marker-shadow.png',
});

// Since Leaflet needs window, we dynamic import it in parent usually, 
// or ensure this component only renders client-side.

export function TrackingMap({ history }: { history: any[] }) {
    // Mock coordinate mapping (In real app, use Geocoding API)
    // This is just for demo visualization
    const getCoords = (city: string) => {
        const lower = city.toLowerCase()
        if (lower.includes('jakarta')) return [-6.2088, 106.8456] as [number, number]
        if (lower.includes('bandung')) return [-6.9175, 107.6191] as [number, number]
        if (lower.includes('surabaya')) return [-7.2575, 112.7521] as [number, number]
        if (lower.includes('semarang')) return [-6.9667, 110.4167] as [number, number]
        // Default fallback (Jakarta)
        return [-6.2088, 106.8456] as [number, number]
    }

    const points = history.map(h => getCoords(h.location || ''))

    // Filter out duplicates to make cleaner lines
    const uniquePoints = points.filter((p, i, self) =>
        i === self.findIndex((t) => (t[0] === p[0] && t[1] === p[1]))
    )

    if (uniquePoints.length === 0) return null

    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 z-0 relative">
            <MapContainer
                center={uniquePoints[0]}
                zoom={6}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Route Line */}
                <Polyline positions={uniquePoints} color="#4f46e5" weight={4} opacity={0.7} />

                {/* Markers */}
                {uniquePoints.map((pos, i) => (
                    <Marker key={i} position={pos}>
                        <Popup>
                            Checkpoint {i + 1}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
