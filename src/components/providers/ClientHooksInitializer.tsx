'use client';

import { useDeepLink } from '@/hooks/useDeepLink';
import { useShake } from '@/hooks/useShake';

/**
 * Client-side initializer for hooks that need to run on app mount
 * This is a client component wrapper to avoid using hooks in server components
 */
export function ClientHooksInitializer() {
    // Initialize Deep Linking
    useDeepLink();

    // Initialize Shake-to-Refresh
    useShake();

    // This component doesn't render anything
    return null;
}
