#!/bin/bash

# =============================================================================
# Setup Tenant Dashboard (SaaS Self-Service Branding)
# =============================================================================

echo "Setting up Tenant Dashboard..."
echo "================================================="
echo ""

# 1. Database Schema
echo "1. Creating Database Schema: tenant_dashboard_schema.sql"
cat <<EOF > tenant_dashboard_schema.sql
-- Ensure Tenants Table Exists
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color_primary TEXT DEFAULT '#4F46E5',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- Sample Data
INSERT INTO public.tenants (id, name, slug, color_primary, logo_url)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Logistik A', 'logistik-a', '#DC2626', 'https://via.placeholder.com/150')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can update their own data
CREATE POLICY "Tenants can update own data" ON public.tenants
    FOR UPDATE USING (true); -- In production, add proper auth check
EOF
echo "   ✓ tenant_dashboard_schema.sql created."
echo ""

# 2. Server Actions
echo "2. Creating Server Actions: app/actions/tenantActions.ts"
mkdir -p app/actions

cat <<EOF > app/actions/tenantActions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTenantBranding(formData: FormData) {
    const supabase = createClient();
    
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const tenantId = formData.get('tenantId') as string; 
    const colorPrimary = formData.get('colorPrimary') as string;
    const logoUrl = formData.get('logoUrl') as string;

    if (!tenantId) return { success: false, error: 'Tenant ID missing' };

    // 2. Validate Inputs
    if (colorPrimary && !/^#[0-9A-F]{6}$/i.test(colorPrimary)) {
        return { success: false, error: 'Invalid color format' };
    }

    // 3. Update DB
    const { error } = await supabase
        .from('tenants')
        .update({ 
            color_primary: colorPrimary,
            logo_url: logoUrl,
            updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);

    if (error) {
        console.error('Update branding failed:', error);
        return { success: false, error: error.message };
    }

    // 4. Revalidate
    revalidatePath('/tenant-admin/settings');

    return { success: true };
}

export async function getTenantData(tenantId: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

    if (error) return null;
    return data;
}
EOF
echo "   ✓ tenantActions.ts created."
echo ""

# 3. Settings Page UI
echo "3. Creating Page: app/tenant-admin/settings/page.tsx"
mkdir -p app/tenant-admin/settings

cat <<EOF > app/tenant-admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { updateTenantBranding } from '@/app/actions/tenantActions';
import { Save, Loader2, Upload } from 'lucide-react';

// Mock Initial Data (replace with Server Component fetch in production)
const INITIAL_DATA = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Logistik A',
    color_primary: '#DC2626',
    logo_url: 'https://via.placeholder.com/150'
};

export default function TenantSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [color, setColor] = useState(INITIAL_DATA.color_primary);
    const [logo, setLogo] = useState(INITIAL_DATA.logo_url);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData(e.currentTarget);
        formData.set('tenantId', INITIAL_DATA.id);
        formData.set('colorPrimary', color);
        formData.set('logoUrl', logo);

        const res = await updateTenantBranding(formData);
        
        if (res.success) {
            setMessage('✓ Branding updated successfully!');
        } else {
            setMessage('✗ Error: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tenant Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your brand identity and appearance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* FORM */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Brand Customization</h2>
                    
                    {/* Logo Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Brand Logo URL
                        </label>
                        <div className="relative">
                            <Upload className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://example.com/logo.png"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Recommended: 150x150px, PNG or SVG</p>
                    </div>

                    {/* Color Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Primary Brand Color
                        </label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="color" 
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                            />
                            <div className="flex-1">
                                <input 
                                    type="text"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={\`p-3 rounded-lg text-sm \${message.includes('✓') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}\`}>
                            {message}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>

                {/* PREVIEW */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Live Preview</h2>
                        <span className="text-xs text-gray-500">Real-time</span>
                    </div>
                    
                    {/* Mock Dashboard Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header */}
                        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                            <img 
                                src={logo} 
                                alt="Logo" 
                                className="h-10 w-auto object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/CCCCCC/000000?text=Logo';
                                }}
                            />
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="h-6 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                            
                            {/* Mock Button using Dynamic Color */}
                            <button 
                                className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition-transform hover:scale-105"
                                style={{ backgroundColor: color }}
                            >
                                Track Package
                            </button>
                            
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                                <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                            </div>

                            {/* Mock Card with Brand Color */}
                            <div 
                                className="p-4 rounded-lg border-l-4 bg-opacity-10"
                                style={{ 
                                    borderLeftColor: color,
                                    backgroundColor: color + '20'
                                }}
                            >
                                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center px-4">
                        Preview shows how your brand colors and logo will appear across the platform
                    </p>
                </div>
            </div>
        </div>
    );
}
EOF
echo "   ✓ Settings Page UI created."
echo ""

echo "================================================="
echo "Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Run tenant_dashboard_schema.sql in Supabase SQL Editor"
echo "2. Visit /tenant-admin/settings to test the dashboard"
echo "3. Customize as needed for production (add proper auth)"
