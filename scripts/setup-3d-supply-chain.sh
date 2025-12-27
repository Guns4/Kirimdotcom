#!/bin/bash

# Setup 3D Supply Chain Visualization
echo "🚀 Setting up 3D Supply Chain Globe..."

# 1. Install Dependencies
echo "📦 Installing Three.js and React Three Fiber..."
npm install three @react-three/fiber @react-three/drei

# 2. Create 3D Globe Component
echo "🌍 Creating 3D Globe..."
mkdir -p src/components/visualization
cat << 'EOF' > src/components/visualization/SupplyChainGlobe.tsx
'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'

interface ShipmentRoute {
    from: { lat: number; lng: number; city: string }
    to: { lat: number; lng: number; city: string }
    status: 'active' | 'completed'
}

function latLngToVector3(lat: number, lng: number, radius: number = 5) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    )
}

function RouteArc({ from, to, status }: ShipmentRoute) {
    const points = useMemo(() => {
        const start = latLngToVector3(from.lat, from.lng)
        const end = latLngToVector3(to.lat, to.lng)
        
        // Create arc between two points
        const curve = new THREE.QuadraticBezierCurve3(
            start,
            new THREE.Vector3().lerpVectors(start, end, 0.5).multiplyScalar(1.3),
            end
        )
        
        return curve.getPoints(50)
    }, [from, to])

    return (
        <Line
            points={points}
            color={status === 'active' ? '#fbbf24' : '#10b981'}
            lineWidth={2}
            opacity={0.8}
        />
    )
}

function LocationMarker({ lat, lng, city, color }: { lat: number; lng: number; city: string; color: string }) {
    const position = latLngToVector3(lat, lng, 5.1)

    return (
        <group position={position}>
            <Sphere args={[0.1, 16, 16]}>
                <meshBasicMaterial color={color} />
            </Sphere>
            <Html distanceFactor={10}>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
                    {city}
                </div>
            </Html>
        </group>
    )
}

function Globe() {
    const globeRef = useRef<THREE.Mesh>(null)

    useFrame(({ clock }) => {
        if (globeRef.current) {
            globeRef.current.rotation.y = clock.getElapsedTime() * 0.05
        }
    })

    return (
        <Sphere ref={globeRef} args={[5, 64, 64]}>
            <meshStandardMaterial
                color="#1e3a8a"
                roughness={0.8}
                metalness={0.2}
                wireframe={false}
            />
        </Sphere>
    )
}

export function SupplyChainGlobe() {
    // Sample routes (Indonesia-centric)
    const routes: ShipmentRoute[] = [
        {
            from: { lat: -6.2088, lng: 106.8456, city: 'Jakarta' },
            to: { lat: 1.3521, lng: 103.8198, city: 'Singapore' },
            status: 'active'
        },
        {
            from: { lat: -6.2088, lng: 106.8456, city: 'Jakarta' },
            to: { lat: 3.1390, lng: 101.6869, city: 'Kuala Lumpur' },
            status: 'completed'
        },
        {
            from: { lat: -6.2088, lng: 106.8456, city: 'Jakarta' },
            to: { lat: 31.2304, lng: 121.4737, city: 'Shanghai' },
            status: 'active'
        },
        {
            from: { lat: -7.2575, lng: 112.7521, city: 'Surabaya' },
            to: { lat: -6.2088, lng: 106.8456, city: 'Jakarta' },
            status: 'completed'
        }
    ]

    // Unique locations
    const locations = useMemo(() => {
        const locs = new Map()
        routes.forEach(route => {
            locs.set(route.from.city, route.from)
            locs.set(route.to.city, route.to)
        })
        return Array.from(locs.values())
    }, [routes])

    return (
        <div className="w-full h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Globe />

                {routes.map((route, i) => (
                    <RouteArc key={i} {...route} />
                ))}

                {locations.map((loc: any) => (
                    <LocationMarker
                        key={loc.city}
                        lat={loc.lat}
                        lng={loc.lng}
                        city={loc.city}
                        color="#fbbf24"
                    />
                ))}

                <OrbitControls 
                    enableZoom={true}
                    enablePan={false}
                    minDistance={10}
                    maxDistance={30}
                />
            </Canvas>

            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white p-4 rounded-lg">
                <h3 className="font-bold text-sm mb-2">Global Supply Chain</h3>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <span>Active Shipments</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span>Completed</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
EOF

# 3. Create Alternative 2D Map View
echo "🗺️ Creating 2D Map View..."
cat << 'EOF' > src/components/visualization/SupplyChainMap.tsx
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
EOF

# 4. Create Dashboard Page
echo "📊 Creating Supply Chain Dashboard..."
mkdir -p src/app/supply-chain
cat << 'EOF' > src/app/supply-chain/page.tsx
'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, TrendingUp, Package, Map } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Dynamic import to avoid SSR issues with Three.js
const SupplyChainGlobe = dynamic(
    () => import('@/components/visualization/SupplyChainGlobe').then(mod => mod.SupplyChainGlobe),
    { ssr: false, loading: () => <div className="h-[600px] bg-slate-800 rounded-xl animate-pulse" /> }
)

const SupplyChainMap = dynamic(
    () => import('@/components/visualization/SupplyChainMap').then(mod => mod.SupplyChainMap),
    { ssr: false }
)

export default function SupplyChainPage() {
    return (
        <div className="container-custom py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Globe className="w-8 h-8 text-blue-600" />
                        3D Supply Chain Visualization
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor global logistics routes in real-time
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Active Shipments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">234</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Map className="w-4 h-4" />
                            Active Routes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">12</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Avg Transit Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">3.5d</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="3d" className="w-full">
                <TabsList>
                    <TabsTrigger value="3d">3D Globe View</TabsTrigger>
                    <TabsTrigger value="2d">2D Map View</TabsTrigger>
                </TabsList>
                <TabsContent value="3d">
                    <SupplyChainGlobe />
                </TabsContent>
                <TabsContent value="2d">
                    <SupplyChainMap />
                </TabsContent>
            </Tabs>
        </div>
    )
}
EOF

echo "✅ 3D Supply Chain Visualization Setup Complete!"
echo "🌍 Interactive globe untuk visualisasi jalur logistik global!"
