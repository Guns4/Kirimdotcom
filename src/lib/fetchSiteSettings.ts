import { createClient } from '@/utils/supabase/server'
import type { SiteSettings } from '@/types/database.types'

/**
 * Fetch site settings from Supabase (Server-side)
 * Used in Server Components and Server Actions
 */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .limit(1)
            .single()

        if (error) {
            console.error('Error fetching site settings:', error.message)
            return null
        }

        return data
    } catch (error) {
        console.error('Failed to fetch site settings:', error)
        return null
    }
}

/**
 * Fetch site settings from Supabase (Client-side)
 * Used in Client Components
 */
export async function fetchSiteSettingsClient(): Promise<SiteSettings | null> {
    try {
        const response = await fetch('/api/site-settings', {
            method: 'GET',
            cache: 'no-cache',
        })

        if (!response.ok) {
            throw new Error('Failed to fetch site settings')
        }

        const data = await response.json()
        return data.settings
    } catch (error) {
        console.error('Failed to fetch site settings:', error)
        return null
    }
}
