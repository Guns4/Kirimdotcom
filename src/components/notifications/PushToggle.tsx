'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { subscribeToPush } from '@/app/actions/push'
import { toast } from 'sonner'

export function PushToggle() {
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(subscription => {
                    setIsSubscribed(!!subscription)
                })
            })
        }
    }, [])

    const handleSubscribe = async () => {
        setLoading(true)
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            })

            await subscribeToPush(subscription.toJSON())
            setIsSubscribed(true)
            toast.success('Notifications enabled!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to enable notifications')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant={isSubscribed ? "secondary" : "primary"}
            onClick={handleSubscribe}
            disabled={loading || isSubscribed}
        >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : isSubscribed ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
            {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
        </Button>
    )
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}
