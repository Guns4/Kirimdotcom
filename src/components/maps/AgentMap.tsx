'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Agent } from '@/app/actions/agent-locator';
// Fix Leaflet marker icons in Next.js
import L from 'leaflet';

// Leaflet icon fix
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface AgentMapProps {
    initialAgents: Agent[];
    onBoundsChange?: (bounds: { minLat: number, maxLat: number, minLng: number, maxLng: number }) => void;
}

function MapEvents({ onBoundsChange }: { onBoundsChange?: any }) {
    const map = useMapEvents({
        moveend: () => {
            if (onBoundsChange) {
                const bounds = map.getBounds();
                onBoundsChange({
                    minLat: bounds.getSouth(),
                    maxLat: bounds.getNorth(),
                    minLng: bounds.getWest(),
                    maxLng: bounds.getEast()
                });
            }
        }
    });
    return null;
}

export default function AgentMap({ initialAgents, onBoundsChange }: AgentMapProps) {
    const [agents, setAgents] = useState<Agent[]>(initialAgents);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    // Initial center (Jakarta)
    const [center, setCenter] = useState<[number, number]>([-6.2088, 106.8456]);

    useEffect(() => {
        // Try to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter([position.coords.latitude, position.coords.longitude]);
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.log('Using default center', error);
                }
            );
        }
    }, []);

    useEffect(() => {
        setAgents(initialAgents);
    }, [initialAgents]);

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg z-0 relative">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapEvents onBoundsChange={onBoundsChange} />

                {userLocation && (
                    <Marker position={userLocation} icon={defaultIcon}>
                        <Popup>Your Location</Popup>
                    </Marker>
                )}

                {agents.map((agent) => (
                    <Marker
                        key={agent.id}
                        position={[agent.latitude, agent.longitude]}
                        icon={defaultIcon}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <h3 className="font-bold text-lg">{agent.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{agent.address}</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {agent.courier_services?.map((service: string) => (
                                        <span key={service} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {service}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p>🕒 {agent.operating_hours || 'N/A'}</p>
                                    <p>📞 {agent.contact_number || 'N/A'}</p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${agent.latitude},${agent.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-2 text-center bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
