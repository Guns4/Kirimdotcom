'use client';

import { logEvent } from '@/app/actions/analyticsActions';

export function trackEvent(name: string, properties: Record<string, any> = {}) {
  // Fire and forget server action
  // Use setTimeout to not block main thread
  setTimeout(() => {
    logEvent(name, properties).catch((err) =>
      console.error('Tracking Error:', err)
    );
  }, 0);
}
