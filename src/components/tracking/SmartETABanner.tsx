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
                setPrediction(res?.data)
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
