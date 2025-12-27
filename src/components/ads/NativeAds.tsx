'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Native Ads Components - Elegant & Non-intrusive
 * Matches CekKirim design system with subtle sponsored labels
 */

// Types
interface AdProps {
    className?: string;
    adSlot?: string;
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

interface NativeAdContent {
    title: string;
    description: string;
    imageUrl?: string;
    ctaText: string;
    link: string;
    advertiser: string;
}

// ============================================
// AD CONTAINER - Base wrapper with styling
// ============================================
export function AdContainer({
    children,
    className,
    label = 'Sponsored',
    variant = 'default',
}: {
    children: React.ReactNode;
    className?: string;
    label?: string;
    variant?: 'default' | 'minimal' | 'accent';
}) {
    const variants = {
        default: 'bg-surface-50 border-surface-100',
        minimal: 'bg-transparent border-surface-100 border-dashed',
        accent: 'bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100',
    };

    return (
        <div
            className={cn(
                'relative rounded-xl border overflow-hidden transition-all duration-300',
                'hover:shadow-soft group',
                variants[variant],
                className
            )}
        >
            {/* Sponsored Label */}
            <div className="absolute top-2 right-2 z-10">
                <span className="text-[10px] font-medium text-surface-400 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {label}
                </span>
            </div>
            {children}
        </div>
    );
}

// ============================================
// IN-FEED AD - Blends with content
// ============================================
export function InFeedAd({
    content,
    className,
}: {
    content?: NativeAdContent;
    className?: string;
}) {
    // Default/placeholder content
    const ad = content || {
        title: 'Promo Ongkir Hemat',
        description: 'Kirim paket lebih murah dengan kurir pilihan',
        imageUrl: '',
        ctaText: 'Lihat Promo',
        link: '#',
        advertiser: 'CekKirim Deals',
    };

    return (
        <AdContainer className={cn('p-4', className)} variant="accent">
            <div className="flex gap-4 items-center">
                {/* Image */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {ad.imageUrl ? (
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <span className="text-2xl">🎁</span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-surface-800 text-sm truncate">{ad.title}</h4>
                    <p className="text-xs text-surface-500 line-clamp-2 mt-0.5">{ad.description}</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-surface-400">{ad.advertiser}</span>
                        <a
                            href={ad.link}
                            className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                        >
                            {ad.ctaText} →
                        </a>
                    </div>
                </div>
            </div>
        </AdContainer>
    );
}

// ============================================
// SIDEBAR STICKY AD - Right column
// ============================================
export function SidebarStickyAd({
    title = 'Rekomendasi',
    items,
    className,
}: {
    title?: string;
    items?: { title: string; price: string; image?: string; link: string }[];
    className?: string;
}) {
    // Default/placeholder items
    const products = items || [
        { title: 'iPhone 15 Case Premium', price: 'Rp 89.000', link: '#' },
        { title: 'Bubble Wrap 50m', price: 'Rp 45.000', link: '#' },
        { title: 'Lakban Coklat Premium', price: 'Rp 25.000', link: '#' },
    ];

    return (
        <div className={cn('sticky top-20', className)}>
            <AdContainer variant="default" label="Ads">
                <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💎</span>
                        <h3 className="font-semibold text-surface-800 text-sm">{title}</h3>
                    </div>

                    {/* Products */}
                    <div className="space-y-3">
                        {products.map((product, index) => (
                            <a
                                key={index}
                                href={product.link}
                                className="flex gap-3 p-2 -mx-2 rounded-lg hover:bg-surface-100 transition-colors group/item"
                            >
                                {/* Product Image */}
                                <div className="w-12 h-12 bg-surface-100 rounded-lg flex-shrink-0 flex items-center justify-center group-hover/item:bg-surface-200 transition-colors">
                                    {product.image ? (
                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span className="text-xl">📦</span>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-medium text-surface-700 line-clamp-2 group-hover/item:text-primary-500 transition-colors">
                                        {product.title}
                                    </h4>
                                    <p className="text-sm font-bold text-secondary-500 mt-1">{product.price}</p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* See More */}
                    <a
                        href="#"
                        className="block text-center text-xs font-medium text-primary-500 hover:text-primary-600 py-2 border-t border-surface-100"
                    >
                        Lihat Semua Produk →
                    </a>
                </div>
            </AdContainer>
        </div>
    );
}

// ============================================
// BANNER AD - Full width
// ============================================
export function BannerAd({
    imageUrl,
    link,
    alt = 'Advertisement',
    className,
}: {
    imageUrl?: string;
    link?: string;
    alt?: string;
    className?: string;
}) {
    return (
        <AdContainer className={cn('p-0', className)} variant="minimal">
            <a href={link || '#'} className="block">
                {imageUrl ? (
                    <img src={imageUrl} alt={alt} className="w-full h-auto object-cover" />
                ) : (
                    <div className="w-full h-24 bg-gradient-to-r from-primary-100 via-surface-100 to-secondary-100 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-surface-400 text-sm">Your Ad Here</p>
                            <p className="text-surface-300 text-xs">728 x 90</p>
                        </div>
                    </div>
                )}
            </a>
        </AdContainer>
    );
}

// ============================================
// ADSENSE UNIT - Google AdSense integration
// ============================================
export function AdSenseUnit({ adSlot, format = 'auto', className }: AdProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && adSlot) {
            try {
                // Push ad if adsbygoogle exists
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                setIsLoaded(true);
            } catch (error) {
                console.log('AdSense not loaded');
            }
        }
    }, [adSlot]);

    if (!adSlot) {
        // Placeholder
        return (
            <AdContainer className={cn('p-4', className)} variant="minimal">
                <div className="h-24 flex items-center justify-center text-surface-300 text-sm">
                    Ad Slot
                </div>
            </AdContainer>
        );
    }

    return (
        <AdContainer className={className} variant="minimal">
            <ins
                ref={adRef as any}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXX"
                data-ad-slot={adSlot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </AdContainer>
    );
}

// ============================================
// LIST WITH ADS - Insert ads between items
// ============================================
export function ListWithAds<T>({
    items,
    renderItem,
    adFrequency = 3,
    adComponent = <InFeedAd />,
}: {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    adFrequency?: number;
    adComponent?: React.ReactNode;
}) {
    const result: React.ReactNode[] = [];

    items.forEach((item, index) => {
        result.push(
            <div key={`item-${index}`}>
                {renderItem(item, index)}
            </div>
        );

        // Insert ad after every `adFrequency` items
        if ((index + 1) % adFrequency === 0 && index < items.length - 1) {
            result.push(
                <div key={`ad-${index}`} className="my-4">
                    {adComponent}
                </div>
            );
        }
    });

    return <>{result}</>;
}

export default {
    AdContainer,
    InFeedAd,
    SidebarStickyAd,
    BannerAd,
    AdSenseUnit,
    ListWithAds,
};
