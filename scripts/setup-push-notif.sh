#!/bin/bash

# Setup Push Notifications Module
echo "🚀 Setting up Push Notifications (VAPID)..."

# 1. Install Dependencies
echo "📦 Installing web-push..."
npm install web-push

# 2. Generate Service Worker
echo "👷 Creating Service Worker..."
cat << 'EOF' > public/sw.js
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url
      },
      actions: [
        {action: 'explore', title: 'Lihat Detail', icon: '/checkmark.png'},
        {action: 'close', title: 'Tutup', icon: '/xmark.png'},
      ]
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action === 'explore') {
     event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})
EOF

# 3. Create Hook & Actions
echo "⚡ Creating Push Subscription Logic..."
mkdir -p src/app/actions
cat << 'EOF' > src/app/actions/push.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { safeAction } from '@/lib/safe-action'
import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export const subscribeToPush = async (subscription: any) => {
    return safeAction(async () => {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Save subscription to DB (create 'push_subscriptions' table manually or via migration if needed)
        // For now logging to console to demo flow
        console.log('Subscribing user:', user?.id, subscription)
        
        // 2. Send test notification immediately
        const payload = JSON.stringify({ title: 'Welcome!', body: 'You are now subscribed to updates.', url: '/dashboard' })
        await webpush.sendNotification(subscription, payload)

        return { success: true }
    })
}
EOF

# 4. Create UI Component
echo "🎨 Creating Push Permission Button..."
mkdir -p src/components/notifications
cat << 'EOF' > src/components/notifications/PushToggle.tsx
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
            variant={isSubscribed ? "secondary" : "default"}
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
EOF

echo "✅ Push Notification Module Setup Complete!"
echo "🔑 IMPORTANT: Generate VAPID Keys now:"
echo "   Run: npx web-push generate-vapid-keys"
echo "   Add to .env.local:"
echo "     NEXT_PUBLIC_VAPID_PUBLIC_KEY=..."
echo "     VAPID_PRIVATE_KEY=..."
echo "     VAPID_EMAIL=your@email.com"
