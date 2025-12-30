'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/store/useSiteSettings';
import { fetchSiteSettingsClient } from '@/lib/fetchSiteSettings';

/**
 * Provider component to fetch and populate site settings on app load
 * This should be wrapped around your app in the root layout
 */
export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setSettings, setLoading, setError } = useSiteSettings();

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const settings = await fetchSiteSettingsClient();

      if (settings) {
        setSettings(settings);
      } else {
        setError('Failed to load site settings');
      }
    };

    loadSettings();
  }, [setSettings, setLoading, setError]);

  return <>{children}</>;
}
