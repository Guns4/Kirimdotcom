'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface ReviewContext {
    trigger: 'DELIVERED' | 'WITHDRAW_SUCCESS';
    id?: string;
}

export function useReviewPrompt() {
    const [isOpen, setIsOpen] = useState(false);
    const [context, setContext] = useState<ReviewContext | null>(null);
    const router = useRouter();

    const triggerReview = useCallback((ctx: ReviewContext) => {
        // Logic: Check if user has already reviewed recently?
        // For simple implementation, we just show it.
        // In prod, check localStorage: if (localStorage.getItem('reviewed')) return;

        console.log(`[ReviewPrompt] Triggered by ${ctx.trigger}`);
        setContext(ctx);
        setIsOpen(true);
    }, []);

    const handlePositive = () => {
        // Happy Path -> Play Store
        // Using 'market://' scheme for direct app store opening on Android
        const PLAY_STORE_URL = 'market://details?id=com.kirimdotcom.app';
        // Fallback for web: 'https://play.google.com/store/apps/details?id=com.kirimdotcom.app'

        window.open(PLAY_STORE_URL, '_system');

        // Mark as reviewed
        localStorage.setItem('has_reviewed', 'true');
        setIsOpen(false);
    };

    const handleNegative = () => {
        // Sad Path -> Internal Feedback
        router.push('/dashboard/feedback?ref=' + context?.trigger);
        setIsOpen(false);
    };

    return {
        isOpen,
        triggerReview,
        handlePositive,
        handleNegative,
        close: () => setIsOpen(false)
    };
}
