'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

interface InternalBannerProps {
    slot: 'sidebar' | 'below_tracking' | 'homepage' | 'blog';
    className?: string;
}

interface AdData {
    campaign_id: string;
    banner_url: string;
    target_url: string;
    advertiser_name: string;
}

export default function InternalBanner({ slot, className = '' }: InternalBannerProps) {
    const [ad, setAd] = useState<AdData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        loadAd();
    }, [slot]);

    const loadAd = async () => {
        try {
            // Get active ad for this slot
            const { data, error } = await supabase
                .rpc('get_active_ad_for_slot', { p_slot_position: slot });

            if (data && data.length > 0) {
                const adData = data[0];
                setAd(adData);

                // Track impression
                trackImpression(adData.campaign_id);
            }
        } catch (error) {
            console.error('Error loading ad:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const trackImpression = async (campaignId: string) => {
        try {
            await supabase.rpc('track_ad_impression', {
                p_campaign_id: campaignId,
                p_viewer_ip: 'unknown', // Would be populated by server
                p_page_url: window.location.href,
            });
        } catch (error) {
            console.error('Error tracking impression:', error);
        }
    };

    const handleClick = async () => {
        if (!ad) return;

        try {
            // Track click
            await supabase.rpc('track_ad_click', {
                p_campaign_id: ad.campaign_id,
                p_clicker_ip: 'unknown',
                p_source_page: window.location.href,
            });

            // Open in new tab
            window.open(ad.target_url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error tracking click:', error);
        }
    };

    if (isLoading) {
        return (
            <div className={`bg-gray-100 rounded-lg animate-pulse ${className}`}>
                <div className="h-32 md:h-48"></div>
            </div>
        );
    }

    if (!ad) {
        return null; // No ad to show
    }

    return (
        <div className={`relative group ${className}`}>
            {/* Ad label */}
            <div className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded z-10">
                Iklan
            </div>

            {/* Banner */}
            <div
                onClick={handleClick}
                className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
                <div className="relative w-full h-32 md:h-48 bg-gray-200">
                    <Image
                        src={ad.banner_url}
                        alt={`Iklan ${ad.advertiser_name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).src = '/placeholder-ad.jpg';
                        }}
                    />
                </div>
            </div>

            {/* Advertiser attribution */}
            <p className="text-xs text-gray-500 mt-1">
                by {ad.advertiser_name}
            </p>
        </div>
    );
}
