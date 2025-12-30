'use client';

import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({
  className = '',
  size = 'sm',
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <CheckCircle
      className={`${sizeClasses[size]} text-blue-500 fill-blue-500 ${className}`}
      aria-label="Verified User"
    />
  );
}
