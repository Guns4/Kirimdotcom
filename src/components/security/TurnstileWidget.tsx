'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function TurnstileWidget({
  onVerify,
  onError,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Using a default test key if env var is missing, to prevent crash during dev
  // Cloudflare Test Site Key: 1x00000000000000000000AA
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  useEffect(() => {
    if (isScriptLoaded && containerRef.current && !widgetId) {
      if (window.turnstile) {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
          'error-callback': () => onError?.(),
          theme: 'auto',
          appearance: 'interaction-only', // Invisible if possible, fallback to interaction
        });
        setWidgetId(id);
      }
    }

    return () => {
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [isScriptLoaded, widgetId, onVerify, onError, siteKey]);

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <div ref={containerRef} className="my-4" />
    </div>
  );
}
