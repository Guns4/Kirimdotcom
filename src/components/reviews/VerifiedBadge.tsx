'use client';

import { BadgeCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className = '' }: VerifiedBadgeProps) {
  return (
    <div
      className={`flex items-center gap-1 text-blue-400 ${className}`}
      title="Verified Customer"
    >
      <BadgeCheck className="w-4 h-4 fill-blue-400/10" />
      <span className="text-xs font-semibold">Verified Customer</span>
    </div>
  );
}
