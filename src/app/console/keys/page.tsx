'use client';
import { useState } from 'react';
import ApiKeyCard from '@/components/console/ApiKeyCard';
import { Beaker, Globe } from 'lucide-react';

export default function KeysPage() {
    const [mode, setMode] = useState<'LIVE' | 'TEST'>('LIVE');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">API Credentials</h2>
                    <p className="text-slate-500">Kelola kunci akses untuk environment Production dan Sandbox.</p>
                </div>

                {/* Toggle Live/Test */}
                <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => setMode('LIVE')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${mode === 'LIVE'
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Globe size={16} /> Live Data
                    </button>
                    <button
                        onClick={() => setMode('TEST')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${mode === 'TEST'
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Beaker size={16} /> Sandbox
                    </button>
                </div>
            </div>

            {mode === 'LIVE' ? (
                <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
                    <p className="text-sm text-blue-800 font-medium">⚠️ Anda sedang melihat <strong>Production Keys</strong>. Request akan memotong saldo kredit.</p>
                </div>
            ) : (
                <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r-lg">
                    <p className="text-sm text-orange-800 font-medium">🧪 Anda sedang melihat <strong>Sandbox Keys</strong>. Gunakan untuk testing gratis (Data Simulasi).</p>
                </div>
            )}

            {/* Render Key Card dengan Data Berbeda Sesuai Mode */}
            <div className="grid gap-6">
                {mode === 'LIVE' ? (
                    <ApiKeyCard />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">TEST MODE</div>
                        <h3 className="font-bold text-slate-900 mb-2">Sandbox Key</h3>
                        <code className="block bg-slate-900 text-orange-400 p-3 rounded-lg font-mono text-sm mb-4">
                            ck_test_99999999_sandbox_key_example
                        </code>
                        <p className="text-sm text-slate-500">Gunakan key ini untuk mendapatkan respon dummy tanpa mengurangi kuota.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
