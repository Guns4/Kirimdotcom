import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { SiteSettings } from '@/types/database.types'

interface SiteSettingsState {
    settings: SiteSettings | null
    isLoading: boolean
    error: string | null
    setSettings: (settings: SiteSettings) => void
    updateSettings: (settings: Partial<SiteSettings>) => void
    setLoading: (isLoading: boolean) => void
    setError: (error: string | null) => void
    reset: () => void
}

const initialState = {
    settings: null,
    isLoading: true,
    error: null,
}

export const useSiteSettings = create<SiteSettingsState>()(
    devtools(
        persist(
            (set) => ({
                ...initialState,
                setSettings: (settings) =>
                    set({ settings, isLoading: false, error: null }),
                updateSettings: (newSettings) =>
                    set((state) => ({
                        settings: state.settings
                            ? { ...state.settings, ...newSettings }
                            : null,
                    })),
                setLoading: (isLoading) => set({ isLoading }),
                setError: (error) => set({ error, isLoading: false }),
                reset: () => set(initialState),
            }),
            {
                name: 'site-settings-storage',
                partialize: (state) => ({ settings: state.settings }),
            }
        ),
        {
            name: 'SiteSettingsStore',
        }
    )
)
