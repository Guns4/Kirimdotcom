'use client';

import { useEffect } from 'react';
import { logClientError } from '@/app/actions/errorLoggingActions';

export default function ErrorMonitor() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Handler for window.onerror (Global JS errors)
        const handleError = (event: ErrorEvent) => {
            logClientError({
                message: event.message || 'Unknown Error',
                stack: event.error?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        };

        // Handler for Unhandled Promise Rejections
        const handleRejection = (event: PromiseRejectionEvent) => {
            logClientError({
                message: `Unhandled Rejection: ${event.reason?.message || event.reason}`,
                stack: event.reason?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent
            });
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    return null; // Render nothing
}
