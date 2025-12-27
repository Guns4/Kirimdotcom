'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { SearchHistoryItem } from './useSearchHistory'

const HISTORY_KEY = 'cek_kirim_history'

export function useMergeHistory() {
    useEffect(() => {
        const merge = async (userId: string) => {
            const localData = localStorage.getItem(HISTORY_KEY)
            if (!localData) return

            const supabase = createClient()

            try {
                const parsed: SearchHistoryItem[] = JSON.parse(localData)
                if (parsed.length === 0) return

                const historyToInsert = parsed.map(item => ({
                    user_id: userId,
                    type: 'resi' as const,
                    query: `${item.resi} (${item.courier.toUpperCase()})`,
                    created_at: new Date(item.timestamp || Date.now()).toISOString()
                }))

                // UPSERT to Supabase
                const { error } = await supabase.from('search_history').upsert(historyToInsert, {
                    onConflict: 'user_id, query', // Assuming standard anti-duplicate logic
                    ignoreDuplicates: true
                })

                if (!error) {
                    console.log('Merge history success, clearing local storage')
                    localStorage.removeItem(HISTORY_KEY)
                }
            } catch (e) {
                console.error('Failed to merge history', e)
            }
        }

        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                merge(session.user.id)
            }
        })

        // Also check initial session in case already logged in
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                merge(session.user.id)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])
}
