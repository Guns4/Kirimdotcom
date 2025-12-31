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
