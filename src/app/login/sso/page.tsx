'use client';

import { useState } from 'react';
import { checkEnterpriseDomain, signInWithEnterpriseSSO, SSOConfig } from '@/lib/sso';
import { Building2, ArrowRight, Loader2, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function EnterpriseLoginPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'found' | 'redirecting'>('idle');
    const [orgConfig, setOrgConfig] = useState<SSOConfig | null>(null);

    const handleCheckDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setStatus('checking');

        try {
            const config = await checkEnterpriseDomain(email);

            if (!config) {
                setError('Domain email ini tidak terdaftar sebagai Enterprise Partner. Hubungi IT Admin Anda.');
                setStatus('idle');
                setIsLoading(false);
                return;
            }

            setOrgConfig(config);
            setStatus('found');
            setIsLoading(false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan.';
            setError(errorMessage);
            setStatus('idle');
            setIsLoading(false);
        }
    };

    const handleSSOLogin = async () => {
        if (!orgConfig) return;

        setIsLoading(true);
        setStatus('redirecting');

        try {
            const { error: ssoError } = await signInWithEnterpriseSSO(email, orgConfig);

            if (ssoError) throw ssoError;
            // Supabase will handle redirect automatically
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal menginisialisasi SSO.';
            setError(errorMessage);
            setStatus('found');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Enterprise Login</h1>
                        <p className="text-slate-500 mt-2">Masuk menggunakan SSO perusahaan Anda</p>
                    </div>

                    {status === 'idle' || status === 'checking' ? (
                        /* Step 1: Enter Email */
                        <form onSubmit={handleCheckDomain} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Kantor
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {status === 'checking' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Memeriksa Domain...
                                    </>
                                ) : (
                                    <>
                                        Lanjutkan
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Step 2: Confirm Organization */
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-green-900">Organisasi Ditemukan</p>
                                        <p className="text-sm text-green-700">{orgConfig?.organization_name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-slate-500" />
                                    <p className="text-sm text-slate-600">
                                        Anda akan diarahkan ke Identity Provider: <strong className="text-slate-800">{orgConfig?.sso_provider?.toUpperCase()}</strong>
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStatus('idle'); setOrgConfig(null); }}
                                    className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={handleSSOLogin}
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {status === 'redirecting' ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Redirecting...
                                        </>
                                    ) : (
                                        <>
                                            Masuk SSO
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Bukan akun Enterprise?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Masuk Regular
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="mt-6 flex items-center justify-center gap-4 text-slate-400 text-xs">
                    <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> SAML 2.0
                    </span>
                    <span>•</span>
                    <span>OpenID Connect</span>
                    <span>•</span>
                    <span>SOC 2 Compliant</span>
                </div>
            </div>
        </div>
    );
}
