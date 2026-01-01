'use client';
import React, { useEffect, useState } from 'react';
import GoogleAdUnit from './GoogleAdUnit';
import DynamicAdSpot from './DynamicAdSpot';

interface Props {
    zone: string;
    googleSlotId: string;
    className?: string;
}

export default function HybridAdSpot({ zone, googleSlotId, className }: Props) {
    const [mode, setMode] = useState<'LOADING' | 'GOOGLE' | 'INTERNAL'>('LOADING');
    const [config, setConfig] = useState<any>({});

    useEffect(() => {
        // Fetch configuration from server
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setConfig(data);

                // Get AdSense ratio (default 70%)
                const ratio = parseInt(data.ADSENSE_RATIO || '70');

                // Roll the dice (0-100)
                const dice = Math.random() * 100;

                // Determine winner
                // If dice < 70 → Show Google (70% chance)
                // If dice >= 70 → Show Internal (30% chance)
                if (dice < ratio) {
                    setMode('GOOGLE');
                } else {
                    setMode('INTERNAL');
                }
            })
            .catch(err => {
                console.error('Config fetch failed:', err);
                // Fallback to Google on error
                setMode('GOOGLE');
                setConfig({ ADSENSE_PUB_ID: 'ca-pub-0000000000000000' });
            });
    }, []);

    // Don't show anything while loading (prevents flicker)
    if (mode === 'LOADING') {
        return null;
    }

    return (
        <div className={className}>
            {mode === 'GOOGLE' ? (
                <GoogleAdUnit
                    pubId={config.ADSENSE_PUB_ID || 'ca-pub-0000000000000000'}
                    slotId={googleSlotId}
                />
            ) : (
                <DynamicAdSpot zone={zone} />
            )}
        </div>
    );
}
