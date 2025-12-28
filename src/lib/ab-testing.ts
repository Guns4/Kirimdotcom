'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from './tracking';

/**
 * Simple hash function to get a deterministic number from a string
 */
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Get a variant for a user based on their ID (or anonymous ID) and experiment name.
 * @param experimentId Unique ID for the experiment (e.g., 'pricing_cta_color')
 * @param variants Array of variant names (e.g., ['blue', 'green'])
 * @param weights Optional weights (must sum to 100), e.g., [50, 50]
 */
export function getVariant(experimentId: string, variants: string[] = ['control', 'variant'], weights?: number[]): string {
    // 1. Get or create anonymous ID
    let userId = '';
    if (typeof window !== 'undefined') {
        userId = localStorage.getItem('ab-user-id') || '';
        if (!userId) {
            userId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('ab-user-id', userId);
        }
    }

    // 2. Deterministic Hash
    const hashInput = `${experimentId}:${userId}`;
    const hash = hashCode(hashInput);
    const range = hash % 100; // 0-99

    // 3. Assign based on weights (default: equal split)
    if (!weights) {
        const index = hash % variants.length;
        return variants[index];
    }

    let cumulativeWeight = 0;
    for (let i = 0; i < variants.length; i++) {
        cumulativeWeight += weights[i];
        if (range < cumulativeWeight) {
            return variants[i];
        }
    }

    return variants[0];
}

/**
 * React Hook for A/B Testing
 */
export function useExperiment(experimentId: string, variants: string[] = ['control', 'variant']) {
    const [variant, setVariant] = useState<string>('control');

    useEffect(() => {
        // Assign variant
        const assigned = getVariant(experimentId, variants);
        setVariant(assigned);

        // Auto-log exposure event
        // We use a flag in session storage to avoid logging duplicate exposure events for same session
        const trackedKey = `tracked_exp_${experimentId}`;
        if (!sessionStorage.getItem(trackedKey)) {
            trackEvent('experiment_exposure', {
                experiment_id: experimentId,
                variant: assigned
            });
            sessionStorage.setItem(trackedKey, 'true');
        }
    }, [experimentId]);

    return variant;
}
