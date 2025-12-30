'use client';

import { useMemo, useState, useEffect } from 'react';
import { ExternalLink, X, TrendingUp } from 'lucide-react';
import localAdsData from '@/data/local-ads.json';

// ============================================
// LOCAL AD BANNER COMPONENT
// ============================================
// Smart contextual ads based on destination city

interface LocalAd {
  id: string;
  keywords?: string[];
  title: string;
  description: string;
  cta: string;
  url: string;
  image?: string;
  bgColor: string;
  priority: number;
}

interface LocalAdBannerProps {
  destinationCity?: string;
  destinationProvince?: string;
  className?: string;
  variant?: 'large' | 'compact' | 'inline';
}

export function LocalAdBanner({
  destinationCity = '',
  destinationProvince = '',
  className = '',
  variant = 'large',
}: LocalAdBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Find matching ad based on destination
  const matchedAd = useMemo(() => {
    if (!destinationCity && !destinationProvince) {
      return null;
    }

    const searchTerms = [
      destinationCity.toLowerCase(),
      destinationProvince.toLowerCase(),
    ].filter(Boolean);

    // Search for matching ads
    const matchingAds = (localAdsData.ads as LocalAd[]).filter((ad) => {
      if (!ad.keywords) return false;
      return ad.keywords.some((keyword) =>
        searchTerms.some(
          (term) =>
            term.includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(term)
        )
      );
    });

    // Sort by priority and return highest
    if (matchingAds.length > 0) {
      return matchingAds.sort((a, b) => b.priority - a.priority)[0];
    }

    return null;
  }, [destinationCity, destinationProvince]);

  // Get fallback ad if no match
  const displayAd = useMemo(() => {
    if (matchedAd) return matchedAd;

    // Return random default ad
    const defaults = localAdsData.defaultAds as LocalAd[];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }, [matchedAd]);

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, [destinationCity]);

  // Track ad impression
  useEffect(() => {
    if (displayAd && isVisible) {
      // Log impression (can be sent to analytics)
      console.log(
        `[Ad Impression] ${displayAd.id} for: ${destinationCity || 'default'}`
      );
    }
  }, [displayAd, isVisible, destinationCity]);

  if (isDismissed || !displayAd) return null;

  // Handle click tracking
  const handleClick = () => {
    console.log(`[Ad Click] ${displayAd.id}`);
    // Can track to analytics here
    window.open(displayAd.url, '_blank', 'noopener,noreferrer');
  };

  // Variant: Compact (for mobile/sidebar)
  if (variant === 'compact') {
    return (
      <div
        className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${className}`}
      >
        <div className={`bg-gradient-to-r ${displayAd.bgColor} p-4`}>
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 p-1 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>

          <p className="text-white font-semibold text-sm mb-1">
            {displayAd.title}
          </p>
          <p className="text-white/80 text-xs mb-2">{displayAd.description}</p>

          <button
            onClick={handleClick}
            className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            {displayAd.cta}
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="absolute bottom-1 left-2 text-[10px] text-white/50">
          Iklan
        </div>
      </div>
    );
  }

  // Variant: Inline (for between content)
  if (variant === 'inline') {
    return (
      <div
        className={`relative overflow-hidden rounded-lg transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${className}`}
      >
        <div
          className={`bg-gradient-to-r ${displayAd.bgColor} p-3 flex items-center gap-3`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {displayAd.title}
            </p>
            <p className="text-white/70 text-xs truncate">
              {displayAd.description}
            </p>
          </div>

          <button
            onClick={handleClick}
            className="flex-shrink-0 px-3 py-1.5 bg-white text-gray-900 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            {displayAd.cta}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>
    );
  }

  // Variant: Large (default - below ongkir results)
  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {/* Background gradient */}
      <div className={`bg-gradient-to-r ${displayAd.bgColor} p-6`}>
        {/* Close button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 right-3 p-1.5 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
          aria-label="Tutup iklan"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Local badge */}
        {matchedAd && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-white text-xs mb-3">
            <TrendingUp className="w-3 h-3" />
            Rekomendasi untuk {destinationCity || destinationProvince}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              {displayAd.title}
            </h3>
            <p className="text-white/90 text-sm md:text-base mb-4">
              {displayAd.description}
            </p>

            <button
              onClick={handleClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              {displayAd.cta}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Image placeholder */}
          {displayAd.image && (
            <div className="hidden md:block w-32 h-32 bg-white/10 rounded-xl" />
          )}
        </div>

        {/* Ad label */}
        <div className="absolute bottom-2 left-4 text-xs text-white/50">
          Iklan • Disponsori
        </div>
      </div>
    </div>
  );
}

// ============================================
// AD PLACEMENT HELPER
// ============================================

interface AdPlacementProps {
  position: 'after-results' | 'sidebar' | 'inline';
  destinationCity?: string;
  destinationProvince?: string;
}

export function SmartAdPlacement({
  position,
  destinationCity,
  destinationProvince,
}: AdPlacementProps) {
  const variant =
    position === 'sidebar'
      ? 'compact'
      : position === 'inline'
        ? 'inline'
        : 'large';

  return (
    <LocalAdBanner
      destinationCity={destinationCity}
      destinationProvince={destinationProvince}
      variant={variant}
      className={position === 'after-results' ? 'mt-6' : ''}
    />
  );
}
