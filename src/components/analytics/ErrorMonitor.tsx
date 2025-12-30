'use client';

import { useEffect } from 'react';
import { logClientError } from '@/app/actions/errorLoggingActions';

export default function ErrorMonitor() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logClientError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        ua: navigator.userAgent,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      logClientError({
        message: `Unhandled Rejection: ${event.reason}`,
        url: window.location.href,
        ua: navigator.userAgent,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
