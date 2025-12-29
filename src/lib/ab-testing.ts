'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/tracking';

/**
 * Deterministic hash function to assign user to a variant
 * Ensures the same user always gets the same variant for an experiment
 */
function getVariant(experimentId: string, userId: string, variants: string[]): string {
    // Simple hashing
    let hash = 0;
    const input = `${experimentId}:${userId}`;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Positive modulo
    const index = Math.abs(hash) % variants.length;
    return variants[index];
}

/**
 * Get stable user ID from localStorage or generate new one
 */
function getUserId(): string {
    if (typeof window === 'undefined') return 'server-side';

    const STORAGE_KEY = 'ab-user-id';
    let userId = localStorage.getItem(STORAGE_KEY);

    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
}

/**
 * AB Testing Hook
 * @param experimentId Unique ID for the experiment
 * @param variants Array of variant names, e.g., ['control', 'variant_a']
 * @returns The assigned variant
 */
export function useExperiment(experimentId: string, variants: string[] = ['control', 'variant']): string {
    // Default to first variant (usually control) during SSR
    const [variant, setVariant] = useState<string>(variants[0]);
    const [hasLogged, setHasLogged] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const userId = getUserId();
            const persistentKey = `ab_exp_${experimentId}`;

            // Check if user already saw this experiment (saved in local storage override)
            // Or just re-calculate deterministically
            const assignedVariant = getVariant(experimentId, userId, variants);

            setVariant(assignedVariant);

            // Log exposure only once per session/mount
            if (!hasLogged && !sessionStorage.getItem(`logged_${experimentId}`)) {
                trackEvent('experiment_exposure', {
                    experiment_id: experimentId,
                    variant: assignedVariant,
                    user_id: userId
                });
                setHasLogged(true);
                sessionStorage.setItem(`logged_${experimentId}`, 'true');
            }
        } catch (error) {
            console.error('[AB Testing] Error:', error);
            // Fallback to control is implicit since state initialized to variants[0]
        }
    }, [experimentId, variants, hasLogged]);

    return variant;
}
