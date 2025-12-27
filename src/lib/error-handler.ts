import { toast } from 'sonner'
import { ActionResponse } from '@/types'

/**
 * Global Error Handler for Client Components & Server Actions
 */
export function handleAppError(error: unknown, silent: boolean = false): ActionResponse {
    let message = 'Terjadi kesalahan sistem. Silakan coba lagi.'
    let errorType = 'UNKNOWN'

    // 1. Detect known error shapes
    if (typeof error === 'string') {
        message = error
    } else if (error instanceof Error) {
        message = error.message
        if (message.includes('fetch failed') || message.includes('network')) {
            message = 'Koneksi internet bermasalah. Periksa jaringan Anda.'
            errorType = 'NETWORK'
        }
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as any).message
    }

    // 2. Log full error for developer
    console.error(`[AppError][${errorType}]`, error)

    // 3. UI Notification (Client Side only)
    if (typeof window !== 'undefined' && !silent) {
        if (errorType === 'NETWORK') {
            toast.error('Gagal terhubung ke server', {
                description: message,
                duration: 5000
            })
        } else {
            toast.error('Gagal memproses permintaan', {
                description: message
            })
        }
    }

    return {
        success: false,
        error: message
    }
}
