'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AdBannerProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  emoji?: string;
  gradient?: string;
  dismissible?: boolean;
}

export default function AdBanner({
  title,
  description,
  ctaText,
  ctaLink,
  emoji = '🎁',
  gradient = 'from-purple-50 to-pink-50',
  dismissible = true,
}: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`relative bg-gradient-to-r ${gradient} rounded-xl p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow`}>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs p-1 rounded-full hover:bg-white/50"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="font-bold text-gray-900 truncate">{title}</h5>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          <a
            href={ctaLink}
            className="inline-block mt-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            {ctaText} →
          </a>
        </div>
      </div>
    </div>
  );
}
