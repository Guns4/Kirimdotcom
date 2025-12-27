'use client'

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOnline) return null

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-50 animate-bounce">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium">You are offline. Changes saved locally.</span>
        </div>
    )
}
