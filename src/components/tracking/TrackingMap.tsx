'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';

// Fix Leaflet Default Icon in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface TrackingMapProps {
    history: any[];
}

// Simple coordinate dictionary for Demo (In real app, use Geocoding API)
const CITY_COORDS: Record<string, [number, number]> = {
    'JAKARTA': [-6.2088, 106.8456],
    'BANDUNG': [-6.9175, 107.6191],
    'SURABAYA': [-7.2575, 112.7521],
    'SEMARANG': [-6.9667, 110.4167],
    'YOGYAKARTA': [-7.7956, 110.3695],
    'MEDAN': [3.5952, 98.6722],
    'MAKASSAR': [-5.1477, 119.4328],
    'DENPASAR': [-8.6705, 115.2126],
    'TANGERANG': [-6.1731, 106.6300],
    'BEKASI': [-6.2383, 106.9756],
    'BOGOR': [-6.5971, 106.8060],
    'DEPOK': [-6.4025, 106.7942],
    'PALEMBANG': [-2.9761, 104.7754],
};

export default function TrackingMap({ history }: TrackingMapProps) {
    const [positions, setPositions] = useState<[number, number][]>([]);

    useEffect(() => {
        // 1. Extract Locations from History
        const foundPositions: [number, number][] = [];

        // We reverse history to start from origin -> destination
        [...history].reverse().forEach(item => {
            const loc = item.location?.toUpperCase() || '';
            const desc = item.desc?.toUpperCase() || '';

            // Try to match city names in location or description
            Object.keys(CITY_COORDS).forEach(city => {
                if (loc.includes(city) || desc.includes(city)) {
                    // Avoid duplicate adjacent points
                    const lastPos = foundPositions[foundPositions.length - 1];
                    const newPos = CITY_COORDS[city];

                    if (!lastPos || (lastPos[0] !== newPos[0] || lastPos[1] !== newPos[1])) {
                        foundPositions.push(newPos);
                    }
                }
            });
        });

        setPositions(foundPositions);
    }, [history]);

    if (positions.length === 0) {
        return (
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                Peta tidak tersedia untuk rute ini.
            </div>
        );
    }

    const center = positions[Math.floor(positions.length / 2)];

    return (
        <div className="h-96 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 z-0 relative">
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Markers */}
                {positions.map((pos, idx) => (
                    <Marker key={idx} position={pos} icon={defaultIcon}>
                        <Popup>
                            Stop #{idx + 1}
                        </Popup>
                    </Marker>
                ))}

                {/* Path Line */}
                <Polyline
                    positions={positions}
                    pathOptions={{ color: '#4f46e5', weight: 4, dashArray: '10, 10', opacity: 0.7 }}
                />

            </MapContainer>
        </div>
    );
}
