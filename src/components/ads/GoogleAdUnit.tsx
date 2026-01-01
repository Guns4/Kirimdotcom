'use client';
import React, { useEffect } from 'react';

interface Props {
    slotId: string;
    pubId: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: boolean;
}

export default function GoogleAdUnit({
    slotId,
    pubId,
    format = 'auto',
    responsive = true
}: Props) {
    useEffect(() => {
        try {
            // Push ad to AdSense queue
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense initialization error:', err);
        }
    }, []);

    // Show placeholder if ID not configured
    if (!pubId || pubId.includes('0000')) {
        return (
            <div className="bg-gray-100 p-8 text-xs text-center text-gray-400 border border-dashed rounded">
                <div className="font-bold mb-1">Google AdSense Placeholder</div>
                <div>Configure Publisher ID in Admin Settings</div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden my-4 text-center">
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={pubId}
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
            ></ins>
        </div>
    );
}
