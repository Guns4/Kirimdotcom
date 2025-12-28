#!/bin/bash

# =============================================================================
# Setup Client Feature Flags (Phase 107)
# React Hook & Context Provider
# =============================================================================

echo "Setting up Client-Side Feature Flags..."
echo "================================================="
echo ""

# 1. Server Action (to fetch all public flags)
echo "1. Creating Fetch Action: src/app/actions/flagActions.ts"

cat <<EOF > src/app/actions/flagActions.ts
'use server'

import { createClient } from '@/utils/supabase/server';
import { unstable_cache } from 'next/cache';

export const getPublicFlags = unstable_cache(
    async () => {
        const supabase = await createClient();
        // Only fetch enabled/disabled state for public usage
        const { data } = await (supabase as any).from('feature_flags').select('key, is_enabled');
        if (!data) return {};
        
        // Convert array to map: { 'payment': true, 'chat': false }
        const flagMap: Record<string, boolean> = {};
        data.forEach((f: any) => {
            flagMap[f.key] = f.is_enabled;
        });
        return flagMap;
    },
    ['public_feature_flags'],
    { revalidate: 60, tags: ['feature_flags'] }
);
EOF
echo "   [✓] Server Action created."
echo ""

# 2. Context Provider
echo "2. Creating Provider: src/components/providers/FeatureFlagProvider.tsx"
mkdir -p src/components/providers

cat <<EOF > src/components/providers/FeatureFlagProvider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';

// Context Shape
type FeatureContextType = Record<string, boolean>;

const FeatureContext = createContext<FeatureContextType>({});

// Provider Component
export function FeatureFlagProvider({ 
    children, 
    initialFlags 
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
EOF
echo "   [✓] Provider & Hook created."
echo ""

# 3. Root Integration Info
echo "3. Integration Instructions"
echo "You need to wrap your app in 'src/app/layout.tsx':"
echo ""
echo "import { getPublicFlags } from '@/app/actions/flagActions';"
echo "import { FeatureFlagProvider } from '@/components/providers/FeatureFlagProvider';"
echo ""
echo "// inside RootLayout component:"
echo "const flags = await getPublicFlags();"
echo ""
echo "// inside return:"
echo "<FeatureFlagProvider initialFlags={flags}>"
echo "   {children}"
echo "</FeatureFlagProvider>"
echo ""

echo "================================================="
echo "Setup Complete!"
