'use client';

import { createContext, useContext, ReactNode } from 'react';

// Context Shape
type FeatureContextType = Record<string, boolean>;

const FeatureContext = createContext<FeatureContextType>({});

// Provider Component
export function FeatureFlagProvider({
  children,
  initialFlags,
}: {
  children: ReactNode;
  initialFlags: Record<string, boolean>;
}) {
  return (
    <FeatureContext.Provider value={initialFlags}>
      {children}
    </FeatureContext.Provider>
  );
}

// Hook
export function useFeature(key: string): boolean {
  const flags = useContext(FeatureContext);
  // Return true/false (safe access)
  return !!flags[key];
}
