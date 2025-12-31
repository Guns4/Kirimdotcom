'use client';

import React, { useEffect, useState } from 'react';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { App } from '@capacitor/app';

interface UpdateStatus {
    status: 'idle' | 'checking' | 'downloading' | 'ready' | 'n/a';
    progress?: number;
}

export default function LiveUpdateManager() {
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ status: 'idle' });

    useEffect(() => {
        checkAndPerformUpdate();

        // Listener for app resume (coming from background)
        App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                checkAndPerformUpdate();
            }
        });
    }, []);

    const checkAndPerformUpdate = async () => {
        try {
            setUpdateStatus({ status: 'checking' });

            // 1. Check current vs latest
            // Note: In Self-hosted, you typically fetch a JSON manifest from your server
            // Mocking the server check here:
            /* 
            const response = await fetch('https://api.cekkirim.com/mobile/version.json');
            const data = await response.json();
            if (data.version !== currentVersion) ...
            */

            // Using Capgo Auto-Update Logic (if configured in capacitor.config.ts)
            // Or Manual Trigger:
            const version = await CapacitorUpdater.download({
                url: 'https://github.com/Liguns/cekkirim-mobile-builds/releases/latest/download/dist.zip',
                version: '1.0.1-hotfix', // This would come from your API
            });

            if (version) {
                setUpdateStatus({ status: 'downloading' });

                // Apply immediately
                await CapacitorUpdater.set({ id: version.id });
                setUpdateStatus({ status: 'ready' });

                // Reload to apply
                // window.location.reload(); 
                // Or wait for next restart
            } else {
                setUpdateStatus({ status: 'n/a' });
            }

        } catch (e) {
            // No update found or error
            setUpdateStatus({ status: 'n/a' });
        }
    };

    // Optional: Visual Indicator for users (Toast)
    if (updateStatus.status === 'downloading') {
        return (
            <div className="fixed bottom-4 right-4 bg-zinc-900 text-white text-xs px-3 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 animate-pulse">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Updating App...
            </div>
        );
    }

    return null;
}
