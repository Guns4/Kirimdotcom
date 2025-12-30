#!/bin/bash

# =============================================================================
# Mobile Admin: PWA & Biometrics (Task 100 - Phase 1601-1605)
# =============================================================================

echo "Initializing Mobile Admin PWA..."
echo "================================================="

# 1. Install Dependencies
echo "1. Installing WebAuthn libraries..."
npm install @simplewebauthn/server @simplewebauthn/browser

# 2. SQL Schema for WebAuthn
echo "2. Generating SQL: webauthn_schema.sql"
cat <<EOF > webauthn_schema.sql
-- Table: User Authenticators (for WebAuthn/Passkeys)
CREATE TABLE IF NOT EXISTS public.user_authenticators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    credential_public_key TEXT NOT NULL,
    counter BIGINT DEFAULT 0,
    transports TEXT[], -- ['usb', 'ble', 'nfc', 'internal']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_authenticators_user ON public.user_authenticators(user_id);

-- RLS
ALTER TABLE user_authenticators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own authenticators" ON user_authenticators
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);
EOF

# 3. Mobile Layout with Bottom Nav
echo "3. Creating Mobile Layout: src/app/admin/mobile/layout.tsx"
mkdir -p src/app/admin/mobile

cat <<'EOF' > src/components/admin/mobile/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Wallet, Settings } from 'lucide-react';

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

    const navItems = [
        { href: '/admin/mobile', label: 'Home', icon: Home },
        { href: '/admin/mobile/tickets', label: 'Tickets', icon: FileText },
        { href: '/admin/mobile/finance', label: 'Finance', icon: Wallet },
        { href: '/admin/mobile/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50 pb-safe">
            {navItems.map((item) => (
                <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <item.icon className="w-6 h-6" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
            ))}
        </div>
    );
}
EOF

cat <<'EOF' > src/app/admin/mobile/layout.tsx
import { BottomNav } from '@/components/admin/mobile/BottomNav';

export default function MobileAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile Header */}
            <header className="bg-white border-b px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
                <h1 className="font-bold text-lg text-gray-900">KirimAdmin</h1>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    KA
                </div>
            </header>

            <main className="p-4">
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
EOF

# 4. Biometric Login Component
echo "4. Creating Biometric Login: src/components/auth/BiometricLogin.tsx"
mkdir -p src/components/auth

cat <<'EOF' > src/components/auth/BiometricLogin.tsx
'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { Fingerprint, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function BiometricLogin() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        try {
            // 1. Get Challenge from Server
            const resp = await fetch('/api/auth/webauthn/generate-options');
            const options = await resp.json();

            // 2. Pass to Browser/Device (FaceID/TouchID)
            const authResponse = await startAuthentication(options);

            // 3. Verify with Server
            const verifyResp = await fetch('/api/auth/webauthn/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authResponse),
            });

            const verification = await verifyResp.json();

            if (verification.verified) {
                toast.success('Login Biometrik Berhasil!');
                router.push('/admin/mobile');
            } else {
                toast.error('Verifikasi Gagal');
            }
        } catch (error) {
            console.error(error);
            toast.error('Biometric Login Failed or Cancelled');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Fingerprint className="w-5 h-5 text-blue-600" />}
            Login with FaceID / TouchID
        </button>
    );
}
EOF

# 5. Mobile Dashboard Page
echo "5. Creating Dashboard: src/app/admin/mobile/page.tsx"
cat <<'EOF' > src/app/admin/mobile/page.tsx
import { createClient } from '@/utils/supabase/server';
import { BiometricLogin } from '@/components/auth/BiometricLogin'; // Importing for settings usage later
import { Package, Users, Wallet, AlertCircle } from 'lucide-react';

async function getQuickStats() {
    const supabase = await createClient();
    // Simplified stats for mobile
    const { count: orders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    return { orders, users };
}

export default async function MobileDashboard() {
    const stats = await getQuickStats();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-gray-500 text-xs">Total Orders</p>
                    <p className="text-xl font-bold text-gray-900">{stats.orders || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mb-2">
                        <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-gray-500 text-xs">Total Users</p>
                    <p className="text-xl font-bold text-gray-900">{stats.users || 0}</p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-blue-200" />
                    <span className="text-sm font-medium text-blue-100">Revenue Today</span>
                </div>
                <p className="text-3xl font-bold">Rp 12,500,000</p>
                <div className="mt-4 flex gap-2">
                    <button className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors">
                        View Report
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors">
                        Withdraw
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Action Required
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Pending Withdrawals</span>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Disputes Open</span>
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">1</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Mobile Admin Setup Complete!"
echo "1. Run schema 'webauthn_schema.sql'."
echo "2. Visit '/admin/mobile' on your phone."
echo "3. Use FaceID/TouchID for quick access."
