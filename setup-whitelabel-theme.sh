#!/bin/bash

# =============================================================================
# Setup Whitelabel Theme (Phase 124)
# Dynamic Branding & Multi-Tenant Support
# =============================================================================

echo "Setting up Whitelabel Theme..."
echo "================================================="
echo ""

# 1. Database Schema
echo "1. Generating SQL Schema..."
echo "   [!] Run this in Supabase SQL Editor:"

cat <<EOF > whitelabel_schema.sql
-- Tenants Table (For Whitelabel Config)
CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL, -- e.g. "Logistik A"
    slug text UNIQUE NOT NULL, -- e.g. "logistik-a"
    logo_url text, -- URL to their logo
    color_primary text DEFAULT '#0066CC', -- Custom Primary Color (Hex)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read tenant config (needed for login/public pages)
CREATE POLICY "Public read tenants" ON public.tenants FOR SELECT USING (true);

-- Seed Data
INSERT INTO public.tenants (name, slug, color_primary) VALUES
('Logistik A', 'logistik-a', '#DC2626'), -- Red
('Logistik B', 'logistik-b', '#16A34A'); -- Green
EOF
echo "   [✓] whitelabel_schema.sql created."
echo ""

# 2. Refactor Tailwind Config
echo "2. Refactoring tailwind.config.ts to use CSS Variables..."

cat <<EOF > tailwind.config.ts
import type { Config } from "tailwindcss";

/**
 * CekKirim Design System (Whitelabel Ready)
 * 
 * Instead of hardcoded Hex, we now use CSS Variables (var(--color-name)).
 * These variables are defined in globals.css (default) OR overridden by ThemeProvider (dynamic).
 */

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)', // Main
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                },
                secondary: {
                    50: '#fff7ed', // Keep secondary static for now or generic
                    500: '#f97316',
                    600: '#ea580c',
                },
                surface: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#eeeeee',
                    800: '#424242',
                    900: '#212121',
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                heading: ['"Plus Jakarta Sans"', 'sans-serif'],
            }
        },
    },
    plugins: [],
};

export default config;
EOF
echo "   [✓] tailwind.config.ts updated."
echo ""

# 3. Theme Provider
echo "3. Creating ThemeProvider: src/providers/ThemeProvider.tsx"
mkdir -p src/providers

cat <<EOF > src/providers/ThemeProvider.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    // Simulate tenant detection via URL param ?tenant=slug
    // In production, this would use subdomain or user session
    const tenantSlug = searchParams.get('tenant');

    useEffect(() => {
        if (!tenantSlug) return;

        const loadTheme = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('tenants')
                .select('color_primary')
                .eq('slug', tenantSlug)
                .single();

            if (data?.color_primary) {
                applyTheme(data.color_primary);
            }
        };

        loadTheme();
    }, [tenantSlug]);

    const applyTheme = (hexColor: string) => {
        const root = document.documentElement;
        
        // Simple logic to generate basic shades (lighter/darker)
        // For a real prod app, use a proper color library like 'tinycolor2' to generate palette
        // Here we just override the main 500 and a 600 approximation
        root.style.setProperty('--color-primary-500', hexColor);
        // Fallback for others: usually you'd calculate these
        root.style.setProperty('--color-primary-600', hexColor); 
    };

    return <>{children}</>;
}
EOF
echo "   [✓] ThemeProvider created."
echo ""

echo "================================================="
echo "Setup Complete!"
echo "1. Run SQL Schema."
echo "2. Wrap RootLayout with <ThemeProvider>."
echo "3. Test: Visit /?tenant=logistik-a (Should turn RED)"
