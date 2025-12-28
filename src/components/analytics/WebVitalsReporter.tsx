'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { trackEvent } from '@/lib/tracking';

export default function WebVitalsReporter() {
    useReportWebVitals((metric) => {
        // Debounce or filter if needed, but for now we log directly
        // We only care about the core metrics usually
        const { id, name, value, rating } = metric;

        // Log to analytics
        // We use a specific event name for easier querying
        trackEvent(`web_vitals`, {
            metric_name: name,
            value: Math.round(name === 'CLS' ? value * 1000 : value), // Normalize CLS
            rating, // 'good' | 'needs-improvement' | 'poor'
            delta: metric.delta,
            id
        });

        // Dev log
        if (process.env.NODE_ENV === 'development') {
            console.log(`[WebVitals] ${name}:`, value, rating);
        }
    });

    return null;
}
