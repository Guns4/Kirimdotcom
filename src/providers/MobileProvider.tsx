'use client';

import { useMobileNative } from '@/hooks/useMobileNative';

export function MobileProvider({ children }: { children: React.ReactNode }) {
    useMobileNative();
    return <>{children}</>;
}
