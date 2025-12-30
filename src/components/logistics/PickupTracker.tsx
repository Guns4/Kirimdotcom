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

    // SSR Check - handled by dynamic import in parent, but safe guard here too
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
