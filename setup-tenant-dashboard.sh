#!/bin/bash

# =============================================================================
# Setup Tenant Dashboard (Phase 131)
# SaaS Self-Service Branding
# =============================================================================

echo "Setting up Tenant Dashboard..."
echo "================================================="
echo ""

# 1. Server Actions
echo "1. Creating Server Actions: src/app/actions/tenantActions.ts"
mkdir -p src/app/actions

cat <<EOF > src/app/actions/tenantActions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTenantBranding(formData: FormData) {
    const supabase = await createClient();
    
    // 1. Auth Check (Must be Tenant Admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // In production, check if user.role === 'tenant_admin' and belongs to this tenant
    // For MVP, we assume the user linked to a tenant via 'user_metadata.tenant_id'
    // const tenantId = user.user_metadata.tenant_id;
    
    // Mocking Tenant ID for demo (Logistik A)
    const tenantId = formData.get('tenantId') as string; 
    
    const colorPrimary = formData.get('colorPrimary') as string;
    const logoUrl = formData.get('logoUrl') as string;

    if (!tenantId) return { success: false, error: 'Tenant ID missing' };

    // 2. Update DB
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

    // 3. Revalidate
    revalidatePath('/tenant-admin/settings');
    revalidatePath('/'); // Revalidate home to see changes if applicable

    return { success: true };
}
EOF
echo "   [✓] tenantActions.ts created."
echo ""

# 2. Settings Page UI
echo "2. Creating Page: src/app/tenant-admin/settings/page.tsx"
mkdir -p src/app/tenant-admin/settings

cat <<EOF > src/app/tenant-admin/settings/page.tsx
'use client';

import { useState } from 'react';
import { updateTenantBranding } from '@/app/actions/tenantActions';
import { Save, Loader2, Upload, Palette } from 'lucide-react';
import Image from 'next/image';

// Mock Data (In real app, fetch via Server Component and pass as prop)
const INITIAL_DATA = {
    id: 'mock-uuid-logistik-a',
    name: 'Logistik A',
    color_primary: '#DC2626', // Red
    logo_url: 'https://via.placeholder.com/150'
};

export default function TenantSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [color, setColor] = useState(INITIAL_DATA.color_primary);
    const [logo, setLogo] = useState(INITIAL_DATA.logo_url);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        // Append current state if not input
        formData.set('tenantId', INITIAL_DATA.id); 

        const res = await updateTenantBranding(formData);
        
        if (res.success) {
            alert('Branding updated successfully!');
        } else {
            alert('Error updating branding: ' + res.error);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tenant Settings</h1>
                    <p className="text-gray-500">Manage your brand identity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FORM */}
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm">
                    {/* Logo Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Brand Logo URL
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Upload className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    name="logoUrl"
                                    type="text" 
                                    value={logo}
                                    onChange={(e) => setLogo(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Color Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Primary Color
                        </label>
                        <div className="flex items-center gap-4">
                            <input 
                                name="colorPrimary"
                                type="color" 
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-mono text-gray-500">{color.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>

                {/* PREVIEW */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h3>
                    
                    {/* Mock Dashboard Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header */}
                        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                             <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                            
                            {/* Mock Button using Dynamic Color */}
                            <button 
                                className="px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all"
                                style={{ backgroundColor: color }}
                            >
                                Track Package
                            </button>
                            
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
                            <div className="h-2 w-2/3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                        This is how your dashboard elements will appear to your customers.
                    </p>
                </div>
            </div>
        </div>
    );
}
EOF
echo "   [✓] Settings Page UI created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo "1. Run this script."
echo "2. Visit /tenant-admin/settings to test."
echo "3. Ensure you have a 'tenants' table from Phase 124."
