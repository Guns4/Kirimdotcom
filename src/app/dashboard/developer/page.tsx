'use client';

import { useState, useEffect } from 'react';
import { createApiKey, revokeApiKey, getKeys } from '@/app/actions/developerActions';
import { Copy, Plus, Trash2, Shield, EyeOff, AlertTriangle, Key } from 'lucide-react';

export default function DeveloperDashboard() {
    const [keys, setKeys] = useState<any[]>([]);
    const [label, setLabel] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const loadKeys = async () => {
        const data = await getKeys();
        setKeys(data);
    };

    useEffect(() => {
        loadKeys();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCreate = async () => {
        setLoading(true);
        const res = await createApiKey(label);
        setLoading(false);

        if (res.success && res.secretKey) {
            setNewKey(res.secretKey);
            setLabel('');
            loadKeys();
        } else {
            alert('Error creating key');
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        await revokeApiKey(id);
        loadKeys();
    };

    const copyToClipboard = () => {
        if (newKey) {
            navigator.clipboard.writeText(newKey);
            alert('Copied to clipboard!');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" />
                Developer API Access
            </h1>
            <p className="text-gray-500 mb-8">Manage your API keys to access CekKirim services programmatically.</p>

            {/* New Key Modal / Alert */}
            {newKey && (
                <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Key className="w-6 h-6 text-green-700" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-900 mb-1">API Key Generated!</h3>
                            <p className="text-green-700 text-sm mb-4">
                                Please copy this key now. You will <span className="font-bold underline">never see it again</span> once you leave this page.
                            </p>

                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white border border-green-200 p-3 rounded-lg font-mono text-sm break-all text-gray-800 shadow-inner">
                                    {newKey}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" /> Copy
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setNewKey(null)} className="text-gray-400 hover:text-gray-600">
                            <EyeOff className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Config Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="font-semibold text-gray-800">Your API Keys</h2>
                    <div className="flex gap-2">
                        <input
                            placeholder="Key Label (e.g. Test Server)"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="bg-white border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={loading || !!newKey}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" /> Generate New Key
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {keys.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            No API keys found. Create one to get started.
                        </div>
                    ) : (
                        keys.map((k) => (
                            <div key={k.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition ${!k.is_active ? 'opacity-50 grayscale' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${k.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900">{k.label}</p>
                                        <p className="font-mono text-xs text-gray-500 flex items-center gap-2">
                                            {k.key_prefix}*************************
                                            {k.is_active && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600">ACTIVE</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>Created: {new Date(k.created_at).toLocaleDateString()}</span>
                                    {k.is_active && (
                                        <button
                                            onClick={() => handleRevoke(k.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-sm text-yellow-800">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                <p>
                    Important: Treat your API keys like passwords. Do not commit them to GitHub.
                    If a key is compromised, revoke it immediately using the button above.
                </p>
            </div>
        </div>
    );
}
