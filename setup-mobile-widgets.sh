#!/bin/bash

# setup-mobile-widgets.sh
# Engagement Hook (Phase 1921-1930)
# features: Widget Sync, Deep Linking, Shared Preferences

echo ">>> Setting up Mobile Widget Infrastructure..."

# 1. Install Dependencies
# @capacitor/preferences: To share data with Native Widgets
# @capacitor/app: For Deep Linking (AppUrlOpen)
npm install @capacitor/preferences @capacitor/app

# 2. Create Widget Data Sync Service
mkdir -p src/services
cat > src/services/widget-sync.ts <<EOF
import { Preferences } from '@capacitor/preferences';

// Key for Native Widget to read
const WIDGET_DATA_KEY = 'widget_last_shipment';

interface WidgetData {
  trackingNumber: string;
  courier: string;
  status: string;
  route: string; // e.g., "CGK -> BDO"
  lastUpdate: string;
}

export const WidgetSyncService = {
  /**
   * Called by Background Fetch or App Open
   * Fetches latest active shipment and saves to SharedPrefs
   */
  async syncLatestShipment() {
    try {
      // TODO: Replace with actual API call to your backend
      // const response = await fetch('/api/user/shipments/latest-active');
      // const shipment = await response.json();

      // MOCK DATA for now
      const mockShipment: WidgetData = {
        trackingNumber: 'JP123456789',
        courier: 'JNE',
        status: 'On Process',
        route: 'CGK -> BDO',
        lastUpdate: new Date().toISOString(),
      };

      // Save to Preferences (Native Widgets can read this via Group/Suite)
      await Preferences.set({
        key: WIDGET_DATA_KEY,
        value: JSON.stringify(mockShipment),
      });

      console.log('✅ Widget Data Synced:', mockShipment);
      return mockShipment;
    } catch (error) {
      console.error('❌ Widget Sync Failed:', error);
      return null;
    }
  },

  /**
   * Read current widget data (for previewing in app)
   */
  async getWidgetData(): Promise<WidgetData | null> {
    const { value } = await Preferences.get({ key: WIDGET_DATA_KEY });
    return value ? JSON.parse(value) : null;
  },
};
EOF

# 3. Create Deep Link Hook
mkdir -p src/hooks
cat > src/hooks/useDeepLink.ts <<EOF
'use client';

import { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { useRouter } from 'next/navigation';

export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    // Handle Deep Links (e.g., cekkirim://track/JP123456)
    const handleUrlOpen = (event: URLOpenListenerEvent) => {
      const url = new URL(event.url);
      const slug = url.pathname.split('/').pop();

      if (url.host === 'track' && slug) {
        // Redirect to tracking detail
        router.push(\`/dashboard/tracking/\${slug}\`);
      }
    };

    App.addListener('appUrlOpen', handleUrlOpen);

    return () => {
      App.removeAllListeners();
    };
  }, [router]);
}
EOF

# 4. Create UI Widget Preview (Component)
mkdir -p src/components/widget
cat > src/components/widget/WidgetPreview.tsx <<EOF
'use client';

import React, { useEffect, useState } from 'react';
import { WidgetSyncService } from '@/services/widget-sync';
import { Card } from '@/components/ui/card';
import { Truck, RefreshCw } from 'lucide-react';

export function WidgetPreview() {
  const [data, setData] = useState<any>(null);

  const refresh = async () => {
    // 1. Force Sync
    await WidgetSyncService.syncLatestShipment();
    // 2. Read Back
    const current = await WidgetSyncService.getWidgetData();
    setData(current);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!data) return <div className="text-sm text-gray-400">Loading Widget Preview...</div>;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500">Widget Preview (iOS/Android)</h3>
        <button onClick={refresh} className="text-indigo-600 hover:text-indigo-800">
            <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {/* Mocking the Native Widget Look */}
      <div className="bg-zinc-900 text-white p-4 rounded-2xl shadow-lg max-w-[300px]">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-500/20 rounded-full">
                    <Truck className="w-4 h-4 text-green-400" />
                </div>
                <span className="font-bold text-sm">{data.courier}</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{data.status}</span>
        </div>
        
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>{data.trackingNumber}</span>
                <span>{new Date(data.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="text-lg font-bold truncate">
                {data.route}
            </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        *Data ini akan disinkronkan ke Homescreen Widget via Shared Preferences.
      </p>
    </div>
  );
}
EOF

echo ">>> Components Created."
echo ">>> INSTRUCTIONS:"
echo "1. Integrate 'useDeepLink()' in your layout or main dashboard component."
echo "2. Place <WidgetPreview /> in the Settings page to show users their widget status."
echo "3. For Android/iOS Native Widget implementation, read 'docs/NATIVE_WIDGETS.md' (Create this manually if needed)."

