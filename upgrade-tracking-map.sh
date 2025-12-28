#!/bin/bash

# =============================================================================
# Upgrade Tracking Visuals (Phase 127)
# Map View with Leaflet & React-Leaflet
# =============================================================================

echo "Upgrading Tracking UI..."
echo "================================================="
echo ""

# 1. Install Dependencies
echo "1. Installing Dependencies..."
echo "   > npm install leaflet react-leaflet @types/leaflet"
# Note: User needs to run this manually if script execution environment doesn't support npm
# We echo it for clarity.

# 2. Create Map Component
echo "2. Creating Component: src/components/tracking/TrackingMap.tsx"
mkdir -p src/components/tracking

cat <<EOF > src/components/tracking/TrackingMap.tsx
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
    // Expected format: "Manifested at Jakarta", "Departed from Bandung", etc.
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
      <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm">
        Peta tidak tersedia untuk rute ini.
      </div>
    );
  }

  const center = positions[Math.floor(positions.length / 2)];

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 z-0 relative">
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
EOF
echo "   [✓] TrackingMap component created."
echo ""

# 3. Update TrackingResults (Add Tabs)
echo "3. Updating TrackingResults: src/components/logistics/TrackingResults.tsx"

cat <<EOF > src/components/logistics/TrackingResults.tsx
'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { TrackResiResult, generateAIInsight } from '@/app/actions/logistics'
import { Package, MapPin, AlertCircle, Sparkles, CheckCircle2, List, Map as MapIcon } from 'lucide-react'
import { ErrorState } from './ErrorState'
import { ShippingInsight } from '../ai/ShippingInsight'
import { ComplaintGenerator } from '../ai/ComplaintGenerator'
import { ShareButton } from '../share/ShareButton'
import { WhatsAppShareButton } from '../tools/WhatsAppShareButton'
import { CourierReviewForm } from '../reviews/CourierReviewForm'
import { useLiteMode } from '@/context/LiteModeContext'
import { useSystemStatus } from '@/context/SystemStatusContext'
import { FailSafeFallback } from './FailSafeFallback'
import { IssueReportButton } from './IssueReportButton'
import { SmartText } from '@/components/common/SmartText'
import dynamic from 'next/dynamic'

// Dynamic Import Map (Client Only)
const TrackingMap = dynamic(() => import('../tracking/TrackingMap'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>,
  ssr: false
})

interface TrackingResultsProps {
    result: TrackResiResult
    onRetry?: () => void
}

export function TrackingResults({ result, onRetry }: TrackingResultsProps) {
    const { isLiteMode } = useLiteMode()
    const { reportError } = useSystemStatus()
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

    if (!result.success) {
        if (result.errorType === 'system_error' || result.errorType === 'network' || result.errorType === 'rate-limit') {
            reportError()
            return (
                <FailSafeFallback
                    courier={(result.courier || 'Ekspedisi').toUpperCase()}
                    officialUrl={result.officialUrl || '#'}
                />
            )
        }

        return (
            <ErrorState
                type={result.errorType || 'general'}
                message={result.error || 'Terjadi kesalahan'}
                onRetry={onRetry}
            />
        )
    }

    const { data } = result

    if (!data) return null

    const isDelivered = data.currentStatus?.toUpperCase().includes('TERKIRIM') ||
        data.currentStatus?.toUpperCase().includes('DELIVERED')

    const getStatusColor = (status: string) => {
        if (status === 'DELIVERED') return 'text-green-400 bg-green-500/20'
        if (status === 'OUT FOR DELIVERY') return 'text-blue-400 bg-blue-500/20'
        if (status.includes('TRANSIT')) return 'text-yellow-400 bg-yellow-500/20'
        return 'text-gray-400 bg-gray-500/20'
    }

    return (
        <div className="space-y-4">
            {/* AI Insight */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isLiteMode ? false : { opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={isLiteMode ? "bg-white p-4 mb-6 border border-purple-100 shadow-sm rounded-xl" : "glass-card p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30"}
            >
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-purple-300 mb-1">AI Insight</p>
                        <p className="text-sm text-gray-300">
                            {generateAIInsight({
                                type: 'resi',
                                data: data,
                            })}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Package Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLiteMode ? false : { opacity: 1, y: 0 }}
                className={isLiteMode ? "bg-white p-6 border border-gray-200 shadow-sm rounded-xl" : "glass-card p-6"}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-400">Nomor Resi</p>
                        <p className="text-xl font-bold text-white">{data.resiNumber}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Kurir</p>
                        <p className="text-lg font-semibold text-indigo-400">{data.courier}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Status Terkini</p>
                        <div className="flex items-center gap-2">
                            <span className={\`px-3 py-1 rounded-full text-sm font-semibold \${getStatusColor(data.currentStatus)}\`}>
                                {data.currentStatus.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Estimasi Sampai</p>
                        <p className="text-white font-semibold">{data.statusDate}</p>
                    </div>
                </div>
            </motion.div>

            <ShippingInsight trackingData={data} />

            <div className="flex gap-2 justify-center flex-wrap">
                <ComplaintGenerator trackingData={data} />
                <ShareButton trackingData={data} />
                <WhatsAppShareButton trackingData={data} />
                <IssueReportButton city={data.history[0]?.location || ''} />
                {isDelivered && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-yellow-500/30"
                    >
                        ⭐ Beri Rating
                    </button>
                )}
            </div>

            {showReviewForm && (
                <CourierReviewForm
                    courierCode={data.courier}
                    courierName={data.courier}
                    resiNumber={data.resiNumber}
                    onClose={() => setShowReviewForm(false)}
                    onSuccess={() => setShowReviewForm(false)}
                />
            )}

            {/* View Toggle */}
            <div className="flex justify-center my-4">
                <div className="bg-white/10 dark:bg-gray-800 p-1 rounded-lg inline-flex items-center">
                    <button
                        onClick={() => setViewMode('list')}
                        className={\`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 \${viewMode === 'list' 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'}\`}
                    >
                        <List className="w-4 h-4" /> Timeline
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={\`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 \${viewMode === 'map' 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'}\`}
                    >
                        <MapIcon className="w-4 h-4" /> Peta
                    </button>
                </div>
            </div>

            {/* Tracking Content (List vs Map) */}
            <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={isLiteMode ? "bg-white p-6 border border-gray-200 shadow-sm rounded-xl" : "glass-card p-6"}
            >
                {viewMode === 'map' ? (
                    <TrackingMap history={data.history} />
                ) : (
                    <>
                        <h3 className="text-lg font-semibold text-white mb-6">Riwayat Tracking</h3>
                        <div className="space-y-6 relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent" />
                            {data.history.map((item, index) => {
                                const isLatest = index === 0
                                const isDelivered = item.desc?.toUpperCase().includes('TERKIRIM') || item.desc?.toUpperCase().includes('DELIVERED')
                                return (
                                    <div key={index} className="relative pl-16">
                                        <div className={\`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center \${isDelivered
                                                ? 'bg-green-500/20 border-2 border-green-500'
                                                : isLatest
                                                    ? 'bg-indigo-500/20 border-2 border-indigo-500 animate-pulse'
                                                    : 'bg-gray-500/20 border-2 border-gray-500'
                                            }\`}>
                                            {isDelivered ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                                            ) : (
                                                <Package className="w-6 h-6 text-indigo-400" />
                                            )}
                                        </div>
                                        <div className={\`p-4 rounded-xl \${isLatest ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-white/5'}\`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className={\`font-semibold \${isLatest ? 'text-indigo-300' : 'text-white'}\`}>
                                                    <SmartText text={item.desc} />
                                                </h4>
                                                <div className="text-right text-sm text-gray-400">
                                                    <div>{item.date}</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-300 mb-2">
                                                <SmartText text={item.desc} />
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                <span>{item.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    )
}
EOF
echo "   [✓] TrackingResults updated with List/Map toggle."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run: npm install leaflet react-leaflet @types/leaflet"
echo "2. Re-run your Next.js server."
echo "3. Track a package and toggle 'Peta' view."
