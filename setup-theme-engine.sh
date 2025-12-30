#!/bin/bash

# =============================================================================
# Whitelabeling & Theme Engine Setup
# =============================================================================

echo "Initializing Theme Engine..."
echo "================================================="

# 1. Database Schema
echo "1. Generating SQL Schema: tenants_schema.sql"
cat <<EOF > tenants_schema.sql
-- 1. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL, -- e.g., 'logistic-corp'
    domain text UNIQUE, -- e.g., 'portal.logistic-corp.com'
    color_primary text DEFAULT '#2563eb', -- Hex Color
    logo_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Link Users to Tenants (Optional, if users belong to a tenant)
-- ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for identification" ON public.tenants FOR SELECT USING (true);
EOF
echo "   [?] Schema created."

# 2. Server Data Fetcher
echo "2. Creating Helper: src/lib/tenant.ts"
mkdir -p src/lib

cat <<EOF > src/lib/tenant.ts
import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';
import { cookies } from 'next/headers';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    color_primary: string;
    logo_url: string;
}

// Cached fetcher for high performance
export const getTenantByHostname = cache(async (hostname: string): Promise<Tenant | null> => {
    const supabase = createClient(cookies());

    // 1. Try match by Custom Domain
    // Sanitize hostname to avoid potential issues if it contains port
    const cleanHostname = hostname.split(':')[0];

    let { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('domain', cleanHostname)
        .single();

    // 2. Fallback: Check subdomain if using main domain (e.g. slug.cekkirim.com)
    if (!data && cleanHostname.includes('.cekkirim.com')) {
        const slug = cleanHostname.split('.')[0];
        const res = await supabase.from('tenants').select('*').eq('slug', slug).single();
        data = res.data;
    }

    return data;
});
EOF
echo "   [?] Tenant Helper created."

# 3. Client Context & Theme Injector
echo "3. Creating Provider: src/providers/TenantProvider.tsx"
mkdir -p src/providers

cat <<EOF > src/providers/TenantProvider.tsx
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
            
            // Optional: Helper logic for variants could go here
        }
    }, [tenant]);

    return (
        <TenantContext.Provider value={{ tenant }}>
            {children}
        </TenantContext.Provider>
    );
}
EOF
echo "   [?] Tenant Provider created."

echo ""
echo "================================================="
echo "Theme Engine Setup Complete!"
echo "1. Run 'tenants_schema.sql' in Supabase."
echo "2. Update your Root Layout ('src/app/layout.tsx'):"
echo "   - Import 'getTenantByHostname' and fetch the tenant based on headers().get('host')."
echo "   - Wrap <body> content with <TenantProvider tenant={tenant}>."
echo "3. Update 'tailwind.config.ts' to use 'var(--primary)' for your primary colors."
