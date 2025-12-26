'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Navigation } from 'lucide-react'

// Fix Leaflet icon
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface Agent {
    id: number
    lat: number
    lon: number
    name: string
    brand?: string
    address?: string
}

function LocationMarker({ onLocationFound }: { onLocationFound?: (lat: number, lon: number) => void }) {
    const [position, setPosition] = useState<[number, number] | null>(null)
    const map = useMap()

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition([e.latlng.lat, e.latlng.lng])
            map.flyTo(e.latlng, map.getZoom())
            if (onLocationFound) {
                onLocationFound(e.latlng.lat, e.latlng.lng)
            }
        })
    }, [map, onLocationFound])

    return position === null ? null : (
        <Marker position={position} icon={icon}>
            <Popup>Lokasi Anda</Popup>
        </Marker>
    )
}

export default function LocationMap() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(false)
    const [userPos, setUserPos] = useState<[number, number] | null>(null)

    // Initial Jakarta coords as fallback
    const center: [number, number] = [-6.2088, 106.8456]

    const searchNearby = async () => {
        if (!userPos) {
            alert("Mohon izinkan akses lokasi terlebih dahulu")
            return
        }

        setLoading(true)
        try {
            // Overpass API Query
            // Search for amenity=post_office OR tag ~ "JNE|J&T|SiCepat|Tiki"
            // Around 2km radius
            const [lat, lon] = userPos
            const query = `
                [out:json][timeout:25];
                (
                  node["amenity"="post_office"](around:2000,${lat},${lon});
                  node["brand"~"JNE|J&T|SiCepat|Tiki|Pos Indonesia",i](around:2000,${lat},${lon});
                  node["name"~"JNE|J&T|SiCepat|Tiki|Pos Indonesia|Ekspedisi",i](around:2000,${lat},${lon});
                );
                out body;
                >;
                out skel qt;
            `

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            })

            const data = await response.json()

            const mappedAgents = data.elements.map((el: any) => ({
                id: el.id,
                lat: el.lat,
                lon: el.lon,
                name: el.tags.name || el.tags.brand || 'Agen Ekspedisi',
                brand: el.tags.brand,
                address: el.tags['addr:street']
            }))

            setAgents(mappedAgents)
        } catch (error) {
            console.error(error)
            alert("Gagal memuat data agen terdekat")
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="space-y-6">
            <div className="h-[400px] w-full rounded-xl overflow-hidden glass-card border-white/10 relative z-0">
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker onLocationFound={(lat, lon) => setUserPos([lat, lon])} />

                    {agents.map(agent => (
                        <Marker
                            key={agent.id}
                            position={[agent.lat, agent.lon]}
                            icon={icon}
                            eventHandlers={{
                                click: () => {
                                    // Optional: Scroll to list item
                                }
                            }}
                        >
                            <Popup>
                                <div className="text-slate-900 font-semibold">{agent.name}</div>
                                <div className="text-slate-600 text-xs">{agent.brand}</div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Floating Search Button */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[400]">
                    <button
                        onClick={searchNearby}
                        disabled={loading || !userPos}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Mencari...' : (
                            <>
                                <MapPin className="w-5 h-5" />
                                Cari Agen Terdekat
                            </>
                        )}
                    </button>
                    {!userPos && (
                        <p className="text-xs text-red-400 bg-black/50 px-2 py-1 rounded mt-2 text-center">
                            Aktifkan GPS
                        </p>
                    )}
                </div>
            </div>

            {/* List Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map(agent => (
                    <div key={agent.id} className="glass-card p-4 flex justify-between items-start">
                        <div>
                            <h3 className="text-white font-bold">{agent.name}</h3>
                            <p className="text-gray-400 text-sm">{agent.brand || 'Ekspedisi Umum'}</p>
                            {agent.address && (
                                <p className="text-gray-500 text-xs mt-1">{agent.address}</p>
                            )}
                        </div>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${agent.lat},${agent.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-indigo-400 transition-colors"
                            title="Petunjuk Arah"
                        >
                            <Navigation className="w-5 h-5" />
                        </a>
                    </div>
                ))}

                {agents.length === 0 && !loading && userPos && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                        Klik tombol "Cari Agen Terdekat" untuk menemukan lokasi servis.
                    </div>
                )}
            </div>
        </div>
    )
}
