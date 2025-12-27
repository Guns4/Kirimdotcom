#!/bin/bash

# Setup Offline Sync Module
echo "🚀 Setting up Offline Sync (TanStack Query + IDB)..."

# 1. Install Dependencies
echo "📦 Installing TanStack Query & Persistence..."
npm install @tanstack/react-query @tanstack/react-query-persist-client idb-keyval

# 2. Create Query Provider with Persistence
echo "⚙️  Configuring Provider..."
mkdir -p src/components/providers
cat << 'EOF' > src/components/providers/QueryProvider.tsx
'use client'

import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ReactNode } from 'react'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 5, // 5 mins
        },
    },
})

// Simplified persister using localStorage (For robust large data, switch to IndexedDB via createAsyncStoragePersister + idb-keyval)
// But for "Lite" sync, localstorage is often enough for small queues.
// We'll trust the user request for "idb-keyval" but for simplicity in this generated file we'll show the localStorage setup first
// or use a custom IDB adapter.

import { get, set, del } from 'idb-keyval'

const idbPersister = {
  persistClient: async (client: any) => {
    await set('react-query-cache', client)
  },
  restoreClient: async () => {
    return await get('react-query-cache')
  },
  removeClient: async () => {
    await del('react-query-cache')
  },
} as any

export function QueryProvider({ children }: { children: ReactNode }) {
    return (
        <PersistQueryClientProvider 
            client={queryClient} 
            persistOptions={{ persister: idbPersister }}
        >
            {children}
        </PersistQueryClientProvider>
    )
}
EOF

# 3. Create Offline Status Indicator
echo "🎨 Creating Offline Indicator..."
mkdir -p src/components/ui
cat << 'EOF' > src/components/ui/NetworkStatus.tsx
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
EOF

echo "✅ Offline Sync Module Setup Complete!"
echo "👉 Wrap your app with <QueryProvider> in layout.tsx"
echo "👉 Add <NetworkStatus /> to layout.tsx"
