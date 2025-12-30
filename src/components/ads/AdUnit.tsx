'use client';

import { useEffect, useState } from 'react';
import { AD_CONFIG } from '@/config/ads';

interface AdUnitProps {
  slot: keyof typeof AD_CONFIG.slots;
  className?: string;
}

export function AdUnit({ slot, className = '' }: AdUnitProps) {
  const config = AD_CONFIG.slots[slot] as any; // Bypass union type restriction for simplicity
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load 200px before appearing
    );

    const element = document.getElementById(`ad-${slot}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [slot]);

  useEffect(() => {
    if (isVisible && AD_CONFIG.enabled && typeof window !== 'undefined') {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error', err);
      }
    }
  }, [isVisible]);

  if (!AD_CONFIG.enabled) return null;

  return (
    <div
      id={`ad-${slot}`}
      className={`ad-container my-4 flex justify-center min-h-[100px] ${className}`}
    >
      {!isVisible ? (
        // Placeholder
        <div className="w-full h-full bg-gray-50/5 rounded animate-pulse" />
      ) : (
        <>
          <div className="text-xs text-center text-gray-300 mb-1 w-full absolute -mt-4">
            Iklan
          </div>
          <ins
            className="adsbygoogle"
            style={{ display: 'block', ...config.style }}
            data-ad-client={AD_CONFIG.publisherId}
            data-ad-slot={config.adUnitId}
            data-ad-format={config.format}
            data-full-width-responsive={config.responsive ? 'true' : 'false'}
            {...(config.layoutKey
              ? { 'data-ad-layout-key': config.layoutKey }
              : {})}
          />
        </>
      )}
    </div>
  );
}
