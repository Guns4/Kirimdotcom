'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
    iconUrl: '/images/leaflet/marker-icon.png',
    shadowUrl: '/images/leaflet/marker-shadow.png',
})

export function SupplyChainMap() {
    const routes = [
        {
            from: [-6.2088, 106.8456],
            to: [1.3521, 103.8198],
            city: 'Jakarta → Singapore',
            status: 'active'
        },
        {
            from: [-6.2088, 106.8456],
            to: [3.1390, 101.6869],
            city: 'Jakarta → KL',
            status: 'completed'
        }
    ]

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg">
            <MapContainer
                center={[-2, 110]}
                zoom={4}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {routes.map((route, i) => (
                    <Polyline
                        key={i}
                        positions={[route.from as any, route.to as any]}
                        color={route.status === 'active' ? '#fbbf24' : '#10b981'}
                        weight={3}
                        opacity={0.7}
                    />
                ))}

                <Marker position={[-6.2088, 106.8456]}>
                    <Popup>Jakarta Hub</Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}
