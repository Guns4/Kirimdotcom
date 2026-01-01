'use client';
import React, { useEffect, useState } from 'react';

interface Props {
    zone: string;
    className?: string;
}

export default function DynamicAdSpot({ zone, className }: Props) {
    const [ad, setAd] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch ad for this zone
        setLoading(true);
        fetch(`/api/ads/serve?zone=${zone}`)
            .then(res => res.json())
            .then(data => {
                if (data.ad) {
                    setAd(data.ad);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Ad fetch error:', err);
                setLoading(false);
            });
    }, [zone]);

    const handleClick = () => {
        if (!ad) return;

        // Track click (fire and forget)
        fetch('/api/ads/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ad_id: ad.id })
        }).catch(err => console.error('Click tracking failed:', err));

        // Open target URL
        window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return null; // Or show skeleton
    }

    if (!ad) {
        return null; // No ad to show
    }

    return (
        <div
            className={`cursor-pointer overflow-hidden rounded ${className}`}
            onClick={handleClick}
        >
            <img
                src={ad.image_url}
                alt={ad.name}
                className="w-full h-full object-cover hover:opacity-95 transition"
                loading="lazy"
            />
            <div className="text-[9px] text-gray-400 text-right pr-1 mt-0.5">
                Sponsored
            </div>
        </div>
    );
}
