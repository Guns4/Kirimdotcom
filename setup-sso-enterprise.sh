#!/bin/bash

# =============================================================================
# Enterprise SSO Setup (SAML 2.0 / OIDC)
# =============================================================================

echo "Initializing Enterprise SSO Configuration..."
echo "================================================="

# 1. Database Schema for Enterprise Management
echo "1. Generating SQL Schema: enterprise_sso_schema.sql"
cat <<EOF > enterprise_sso_schema.sql
-- 1. Table to map Domains to SSO Configurations
CREATE TABLE IF NOT EXISTS public.enterprise_sso_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_name text NOT NULL,
    domain text UNIQUE NOT NULL, -- e.g., 'logistik-a.com'
    sso_provider_id uuid, -- Link to auth.sso_providers if you have access, or store slug
    redirect_url text, -- Custom landing page after login, e.g., '/dashboard/enterprise-a'
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Auto-Provisioning Trigger
-- Automatically assigns 'Staff' role and links to organization if email matches
CREATE OR REPLACE FUNCTION public.handle_enterprise_new_user()
RETURNS TRIGGER AS \$\$
DECLARE
    matched_org_id uuid;
BEGIN
    -- Check if new user's email domain matches an enterprise config
    SELECT id INTO matched_org_id
    FROM public.enterprise_sso_config
    WHERE domain = split_part(NEW.email, '@', 2);

    IF matched_org_id IS NOT NULL THEN
        -- Assign Role 'Staff'
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'Staff')
        ON CONFLICT (user_id) DO NOTHING;
        
        -- (Optional) Add to Organization Members table if you have one
        -- INSERT INTO public.organization_members (user_id, org_id) VALUES (NEW.id, matched_org_id);
    END IF;

    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trg_enterprise_provisioning ON auth.users;
CREATE TRIGGER trg_enterprise_provisioning
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_enterprise_new_user();

-- Seed Data (Example)
INSERT INTO public.enterprise_sso_config (organization_name, domain, redirect_url)
VALUES 
    ('Logistik A Corp', 'logistik-a.com', '/dashboard/corp-a'),
    ('Global Shipping Ltd', 'global-shipping.com', '/dashboard/global')
ON CONFLICT (domain) DO NOTHING;
EOF
echo "   [?] Schema created."

# 2. SSO Helper Logic (Frontend)
echo "2. Creating Frontend Helper: src/lib/sso.ts"
mkdir -p src/lib
cat <<EOF > src/lib/sso.ts
import { createClient } from '@/utils/supabase/client'; // Adjust path to your client

// Check if email belongs to an enterprise domain
export async function checkEnterpriseDomain(email: string) {
    const domain = email.split('@')[1];
    if (!domain) return null;

    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('enterprise_sso_config')
        .select('*')
        .eq('domain', domain)
        .single();

    if (error || !data) return null;
    return data;
}

// Initiate SSO Login
export async function signInWithEnterpriseSSO(email: string, domainConfig: any) {
    const supabase = createClient();
    
    // Supabase signInWithSSO logic
    const { data, error } = await supabase.auth.signInWithSSO({
        domain: domainConfig.domain, // Or providerId if you prefer
        options: {
            redirectTo: \`\${window.location.origin}\${domainConfig.redirect_url || '/dashboard'}\`,
        }
    });

    return { data, error };
}
EOF
echo "   [?] Helper created."

# 3. Enterprise Login Page
echo "3. Creating SSO Login Page: src/app/login/sso/page.tsx"
mkdir -p src/app/login/sso

cat <<EOF > src/app/login/sso/page.tsx
'use client';

import { useState } from 'react';
import { checkEnterpriseDomain, signInWithEnterpriseSSO } from '@/lib/sso';
import { Building2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EnterpriseLoginPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'redirecting'>('idle');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setStatus('checking');

        try {
            // 1. Check Domain
            const config = await checkEnterpriseDomain(email);
            
            if (!config) {
                setError('Domain email ini tidak terdaftar sebagai Enterprise Partner.');
                setStatus('idle');
                setIsLoading(false);
                return;
            }

            // 2. Redirect to Provider
            setStatus('redirecting');
            const { error: ssoError } = await signInWithEnterpriseSSO(email, config);
            
            if (ssoError) throw ssoError;
            
            // Should redirect automatically by Supabase
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat inisialisasi SSO.');
            setStatus('idle');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Enterprise Login</h1>
                    <p className="text-slate-500 mt-2">Masuk menggunakan Single Sign-On (SSO) perusahaan Anda.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Kantor</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="nama@perusahaan.com"
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {status === 'redirecting' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Mengarahkan ke Identity Provider...
                            </>
                        ) : status === 'checking' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Memeriksa Domain...
                            </>
                        ) : (
                            <>
                                Lanjutkan ke SSO
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                        Bukan akun Enterprise?{' '}
                        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Masuk Regular
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
EOF
echo "   [?] Login Page created."

echo ""
echo "================================================="
echo "SSO Setup Complete!"
echo "Steps to finalize:"
echo "1. Run 'enterprise_sso_schema.sql' in Supabase SQL Editor."
echo "2. Configure your SAML/OIDC Identity Provider (Azure AD, Google Workspace, Okta) in the Supabase Dashboard > Authentication > Providers."
echo "3. Add your domains to the 'public.enterprise_sso_config' table."
echo "4. Use '/login/sso' for corporate access."
