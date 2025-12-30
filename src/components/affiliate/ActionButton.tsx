'use client';

import { ExternalLink, ShoppingCart } from 'lucide-react';
import {
  getCourierAffiliateConfig,
  type CourierAffiliateConfig,
} from '@/config/affiliates';

interface ActionButtonProps {
  courierCode: string;
  variant?: 'default' | 'compact' | 'ongkir';
  className?: string;
}

export function ActionButton({
  courierCode,
  variant = 'default',
  className = '',
}: ActionButtonProps) {
  const config = getCourierAffiliateConfig(courierCode);

  if (!config || !config.actionEnabled || !config.affiliateUrl) {
    return null;
  }

  const handleClick = async () => {
    // Track click (optional - for analytics)
    if (config.trackClicks) {
      try {
        await fetch('/api/affiliate/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courierCode: config.code,
            affiliateType: config.affiliateType,
            destinationUrl: config.affiliateUrl,
          }),
        }).catch(() => {}); // Silent fail
      } catch {
        // Ignore tracking errors
      }
    }

    // Open affiliate link
    window.open(config.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all ${className}`}
      >
        <ExternalLink className="w-3 h-3" />
        {config.actionLabel}
      </button>
    );
  }

  if (variant === 'ongkir') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-green-500/20 ${className}`}
      >
        <ShoppingCart className="w-4 h-4" />
        Pesan via {config.name}
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all text-sm font-medium ${className}`}
    >
      <ExternalLink className="w-4 h-4" />
      {config.actionLabel}
    </button>
  );
}

// Multi-courier action buttons (for ongkir results)
interface MultiActionButtonsProps {
  courierCodes: string[];
}

export function MultiActionButtons({ courierCodes }: MultiActionButtonsProps) {
  const uniqueCouriers = [...new Set(courierCodes)];

  if (uniqueCouriers.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {uniqueCouriers.map((code) => (
        <ActionButton key={code} courierCode={code} variant="compact" />
      ))}
    </div>
  );
}
