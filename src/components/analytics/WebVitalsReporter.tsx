'use client';

import { useReportWebVitals } from 'next/web-vitals';

export default function WebVitalsReporter() {
    useReportWebVitals((metric) => {
        // Analytics Logger
        // Example: Send to your own analytics endpoint
        // console.log(metric);

        // In a real app, send to 'analytics_events' table via a server action or API
        // const body = JSON.stringify(metric);
        // const url = '/api/analytics/vitals';
        // if (navigator.sendBeacon) {
        //   navigator.sendBeacon(url, body);
        // } else {
        //   fetch(url, { body, method: 'POST', keepalive: true });
        // }
    });

    return null;
}
