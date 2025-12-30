'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
  className?: string;
}

export function LazyAd({
  slot,
  format = 'auto',
  style,
  className,
}: LazyAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before ad is visible
        threshold: 0.01,
      }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && !adLoaded) {
      // Load AdSense script only when ad is about to be visible
      try {
        // @ts-ignore
        if (window.adsbygoogle && window.adsbygoogle.loaded !== true) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
        setAdLoaded(true);
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [isVisible, adLoaded]);

  return (
    <div
      ref={adRef}
      className={className}
      style={{
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {isVisible ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', ...style }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense ID
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        // Placeholder while ad is loading
        <div
          style={{
            width: '100%',
            minHeight: '100px',
            background:
              'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s ease-in-out infinite',
          }}
        >
          {/* Loading skeleton */}
        </div>
      )}
      <style jsx>{`
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
