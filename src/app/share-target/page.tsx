'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// This page handles incoming shares from Android Intent
export default function ShareTargetPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState('Processing shared data...')

    useEffect(() => {
        const title = searchParams.get('title')
        const text = searchParams.get('text')
        const url = searchParams.get('url')

        // Heuristic: If text looks like a receipt number, go to tracking
        // If it looks like a lot of text, maybe go to parse receipt tool

        // Simple logic for MVP:
        const payload = text || title || url

        if (payload) {
            // Regex for receipt (Alphanumeric 8-20 chars)
            const receiptRegex = /\b[A-Z0-9]{8,20}\b/g
            const matches = payload.match(receiptRegex)

            if (matches && matches.length > 0) {
                // Determine it's a tracking request
                const resi = matches[0]
                setStatus(`Found receipt: ${resi}. Redirecting...`)
                setTimeout(() => router.push(`/bulk-tracking?resi=${resi}`), 1000)
            } else {
                // Default handling
                setStatus('No clear receipt found. Opening dashboard...')
                setTimeout(() => router.push('/dashboard'), 1500)
            }
        } else {
            router.push('/')
        }
    }, [searchParams, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        Analyzing Share...
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    {status}
                </CardContent>
            </Card>
        </div>
    )
}
