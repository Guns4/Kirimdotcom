'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';
import AddAgentForm from './AddAgentForm';

// Fix Leaflet default icon issue in Next.js/Webpack
const icon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface AgentMapProps {
    districtName: string;
}

export default function AgentMap({ districtName }: AgentMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>;
    }

    // Mock initial coordinate (Jakarta/Bandung generic center)
    // In a real app, we'd Geocode the `districtName` to get center [lat, lng]
    const defaultCenter: [number, number] = [-6.9175, 107.6191]; // Bandung coord as default

    const mockAgents = [
        { id: 1, name: `JNE ${districtName} Pusat`, pos: [-6.9175, 107.6191] as [number, number] },
        { id: 2, name: `SiCepat Point ${districtName}`, pos: [-6.9200, 107.6250] as [number, number] },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 my-12">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Lokasi Agen Terdekat di {districtName}
                    </h2>
                    <p className="text-gray-600 text-sm">Temukan tempat drop paket tanpa antre.</p>
                </div>
                <AddAgentForm />
            </div>

            <div className="h-[400px] w-full rounded-xl overflow-hidden relative z-0">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {mockAgents.map(agent => (
                        <Marker key={agent.id} position={agent.pos} icon={icon}>
                            <Popup>
                                <div className="font-sans">
                                    <strong className="block text-sm mb-1">{agent.name}</strong>
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified Agent</span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
