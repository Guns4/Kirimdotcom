'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchFeatureFlags } from '@/lib/flags';

interface FlagContextType {
  flags: Record<string, boolean>;
  isLoading: boolean;
}

const FeatureFlagContext = createContext<FlagContextType>({
  flags: {},
  isLoading: true,
});

export function FeatureFlagProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchFeatureFlags();
      setFlags(data);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ flags, isLoading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
