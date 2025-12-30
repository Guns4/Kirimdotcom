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
            if (!resp.ok) throw new Error('Auth init failed');
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
