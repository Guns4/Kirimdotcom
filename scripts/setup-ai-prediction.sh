#!/bin/bash

# Setup Predictive ETA Module
echo "🚀 Setting up AI Predictive ETA Engine..."

# 1. Create Database Migration
echo "🗄️ Creating Database Migration..."
mkdir -p src/utils/supabase/migrations
cat << 'EOF' > src/utils/supabase/migrations/20241227_predictive_eta.sql
CREATE TABLE IF NOT EXISTS transit_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    courier TEXT NOT NULL,      -- 'jne', 'jnt', 'sicepat'
    origin_city TEXT NOT NULL,  -- 'Jakarta', 'Bandung'
    dest_city TEXT NOT NULL,    -- 'Surabaya', 'Medan'
    duration_hours INTEGER NOT NULL,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_transit_stats_lookup ON transit_stats(courier, origin_city, dest_city);
EOF

# 2. Create Server Action with AI Logic
echo "🧠 Creating AI Prediction Logic..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/prediction.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'

// Helper to calculate Weighted Average
// Recent shipments (last 30 days) get 2x weight
function calculateWeightedAverage(stats: any[]) {
    let totalWeightedDuration = 0
    let totalWeight = 0
    const now = new Date().getTime()

    for (const stat of stats) {
        const deliveredTime = new Date(stat.delivered_at).getTime()
        const daysAgo = (now - deliveredTime) / (1000 * 60 * 60 * 24)
        
        // Weight: 2 if within 30 days, else 1
        const weight = daysAgo <= 30 ? 2 : 1
        
        totalWeightedDuration += (stat.duration_hours * weight)
        totalWeight += weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedDuration / totalWeight) : null
}

export const getSmartETA = async (courier: string, origin: string, dest: string) => {
    return safeAction(async () => {
        const supabase = await createClient()
        
        // 1. Fetch Historical Data (Last 100 successful shipments for this route)
        // Normalize cities (simple lowercase for demo)
        const originNorm = origin.toLowerCase()
        const destNorm = dest.toLowerCase()

        const { data: stats } = await supabase
            .from('transit_stats')
            .select('duration_hours, delivered_at')
            .eq('courier', courier.toLowerCase())
            .eq('origin_city', originNorm)
            .eq('dest_city', destNorm)
            .order('delivered_at', { ascending: false })
            .limit(100)

        if (!stats || stats.length < 5) {
            return { 
                predicted: false, 
                message: "Not enough data for AI prediction. Using standard ETA." 
            }
        }

        // 2. Calculate Prediction
        const avgHours = calculateWeightedAverage(stats)
        
        if (!avgHours) return { predicted: false }

        // 3. Format result
        const estimatedDate = new Date()
        estimatedDate.setHours(estimatedDate.getHours() + avgHours)

        return {
            predicted: true,
            avg_hours: avgHours,
            estimated_arrival: estimatedDate.toISOString(),
            confidence_score: Math.min(stats.length, 100), // Simple confidence metric
            message: `Prediksi CekKirim: Sampai sekitar ${avgHours} jam lagi (${estimatedDate.toLocaleDateString()})`
        }
    })
}
EOF

# 3. Create UI Component
echo "🎨 Creating ETA Banner Component..."
mkdir -p src/components/tracking
cat << 'EOF' > src/components/tracking/SmartETABanner.tsx
'use client'

import { useEffect, useState } from 'react'
import { getSmartETA } from '@/app/actions/prediction'
import { Sparkles, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function SmartETABanner({ courier, origin, dest }: { courier: string, origin: string, dest: string }) {
    const [prediction, setPrediction] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (courier && origin && dest) {
            getSmartETA(courier, origin, dest).then(res => {
                setPrediction(res.data)
                setLoading(false)
            })
        }
    }, [courier, origin, dest])

    if (loading || !prediction?.predicted) return null

    return (
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 mb-4 animate-fade-in-up border-none shadow-lg">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                    <h4 className="font-bold flex items-center gap-2">
                        Smart Prediction
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">BETA</span>
                    </h4>
                    <p className="text-sm text-white/90 mt-1">
                        Berdasarkan {prediction.confidence_score} pengiriman sebelumnya, paket diprediksi sampai:
                    </p>
                    <div className="mt-2 flex items-center gap-2 font-mono text-lg font-bold bg-black/20 w-fit px-3 py-1 rounded">
                        <Clock className="w-4 h-4" />
                        {new Date(prediction.estimated_arrival).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </div>
        </Card>
    )
}
EOF

echo "✅ Predictive ETA Module Setup Complete!"
