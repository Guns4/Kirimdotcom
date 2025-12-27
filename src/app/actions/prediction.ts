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
