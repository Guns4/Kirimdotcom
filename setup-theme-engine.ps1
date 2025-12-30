# Whitelabeling & Theme Engine Setup (PowerShell)

Write-Host "Initializing Theme Engine..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Database Schema
Write-Host "1. Generating SQL Schema: tenants_schema.sql" -ForegroundColor Yellow

$schemaContent = @'
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
'@

$schemaContent | Set-Content -Path "tenants_schema.sql" -Encoding UTF8
Write-Host "   [?] Schema created." -ForegroundColor Green

# 2. Server Data Fetcher
Write-Host "2. Creating Helper: src/lib/tenant.ts" -ForegroundColor Yellow
$dirLib = "src\lib"
if (!(Test-Path $dirLib)) { New-Item -ItemType Directory -Force -Path $dirLib | Out-Null }

$tenantTs = @'
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
    const cleanHostname = hostname.split(':')[0]; // Remove port if present

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
'@

$tenantTs | Set-Content -Path "src\lib\tenant.ts" -Encoding UTF8
Write-Host "   [?] Tenant Helper created." -ForegroundColor Green

# 3. Client Context & Theme Injector
Write-Host "3. Creating Provider: src/providers/TenantProvider.tsx" -ForegroundColor Yellow
$dirProviders = "src\providers"
if (!(Test-Path $dirProviders)) { New-Item -ItemType Directory -Force -Path $dirProviders | Out-Null }

$providerTsx = @'
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
'@

$providerTsx | Set-Content -Path "src\providers\TenantProvider.tsx" -Encoding UTF8
Write-Host "   [?] Tenant Provider created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Theme Engine Setup Complete!" -ForegroundColor Green
Write-Host "1. Run 'tenants_schema.sql' in Supabase." -ForegroundColor White
Write-Host "2. Update your Root Layout ('src/app/layout.tsx'):" -ForegroundColor White
Write-Host "   - Import 'getTenantByHostname' and fetch the tenant based on headers().get('host')." -ForegroundColor White
Write-Host "   - Wrap <body> content with <TenantProvider tenant={tenant}>." -ForegroundColor White
Write-Host "3. Update 'tailwind.config.ts' to use 'var(--primary)' for your primary colors." -ForegroundColor White
