'use client';

import { createContext, useContext, useEffect } from 'react';
import { Tenant } from '@/lib/tenant';

interface TenantContextType {
    tenant: Tenant | null;
}

const TenantContext = createContext<TenantContextType>({ tenant: null });

export const useTenant = () => useContext(TenantContext);

export function TenantProvider({ 
    children, 
    tenant 
}: { 
    children: React.ReactNode; 
    tenant: Tenant | null; 
}) {
    // Dynamic Style Injection
    useEffect(() => {
        if (tenant?.color_primary) {
            const root = document.documentElement;
            // Inject CSS Variable
            root.style.setProperty('--primary', tenant.color_primary);
            
            // Optional: If using Tailwind with RGB variables, you might need to convert Hex to RGB
            // setProperty('--primary-rgb', hexToRgb(tenant.color_primary));
        }
    }, [tenant]);

    return (
        <TenantContext.Provider value={{ tenant }}>
            {/* 
              Optional: Render a discrete style tag if you need strict CSS override immediately 
              or complex overrides not possible via variables
            */}
            {children}
        </TenantContext.Provider>
    );
}
