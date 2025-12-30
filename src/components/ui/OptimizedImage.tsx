'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * OptimizedImage Component
 * Next.js Image with blur placeholder and lazy loading
 */

// Default blur placeholder (tiny blurred gray)
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQrJyEwPENBLzMzLy0zPVBCR0JHMy1LVEtXXl9gZF9oampqcnJ6g4ODg///2wBDARUXFx4aHh4gICAoMS0xLSgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwA/TKgAf//Z';

// Generate blur data URL from color
function generateBlurPlaceholder(color: string = '#e5e7eb'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="1" />
      </filter>
      <rect width="100%" height="100%" fill="${color}" filter="url(#b)" />
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder'> {
  fallbackColor?: string;
  showSkeleton?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackColor = '#e5e7eb',
  showSkeleton = true,
  aspectRatio = 'auto',
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-surface-100 text-surface-400',
          aspectRatioClass[aspectRatio],
          className
        )}
        style={{ backgroundColor: fallbackColor }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatioClass[aspectRatio],
        className
      )}
    >
      {/* Skeleton loading */}
      {isLoading && showSkeleton && (
        <div className="absolute inset-0 bg-surface-200 animate-pulse" />
      )}

      <Image
        src={src}
        alt={alt}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        loading={priority ? 'eager' : 'lazy'}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
}

/**
 * Avatar Image with fallback initials
 */
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  name,
  size = 'md',
  className,
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src || error) {
    const initials = getInitials(name);
    const bgColor = name
      ? `hsl(${(name.charCodeAt(0) * 10) % 360}, 70%, 50%)`
      : '#6b7280';

    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-medium',
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

/**
 * Product Image with zoom on hover
 */
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  enableZoom?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  enableZoom = true,
}: ProductImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div
      className={cn(
        'relative aspect-square overflow-hidden bg-surface-100 rounded-xl cursor-zoom-in',
        className
      )}
      onMouseEnter={() => enableZoom && setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-transform duration-300',
          isZoomed && 'scale-110'
        )}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

/**
 * Background Image with lazy loading
 */
interface BackgroundImageProps {
  src: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function BackgroundImage({
  src,
  alt = '',
  children,
  className,
  overlay = false,
  overlayOpacity = 0.5,
}: BackgroundImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        loading="lazy"
        quality={85}
      />

      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Responsive image sizes helper
 */
export const imageSizes = {
  thumbnail: '(max-width: 640px) 25vw, 10vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  hero: '100vw',
  product: '(max-width: 768px) 100vw, 50vw',
  avatar: '64px',
};

export { BLUR_DATA_URL, generateBlurPlaceholder };
export default OptimizedImage;
