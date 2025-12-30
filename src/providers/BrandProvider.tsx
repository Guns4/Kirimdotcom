'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getMockTenant, type TenantConfig } from '@/lib/tenant';

interface BrandContextType {
    tenant: TenantConfig;
    isLoading: boolean;
}

const BrandContext = createContext<BrandContextType>({
    tenant: getMockTenant('DEFAULT'),
    isLoading: true
});

export function useBrand() {
    return useContext(BrandContext);
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
    const [tenant, setTenant] = useState<TenantConfig>(getMockTenant('DEFAULT'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadBrand() {
            // In real app, fetch from API
            // For demo: verify if we want to simulate a specific tenant
            // const config = await getCurrentTenant();

            // SIMULATION: If URL contains ?demo=tenant, show custom brand
            if (typeof window !== 'undefined' && window.location.search.includes('demo=tenant')) {
                setTenant(getMockTenant('CUSTOM'));
            } else {
                setTenant(getMockTenant('DEFAULT'));
            }

            setIsLoading(false);
        }
        loadBrand();
    }, []);

    return (
        <BrandContext.Provider value={{ tenant, isLoading }}>
            {children}
        </BrandContext.Provider>
    );
}
