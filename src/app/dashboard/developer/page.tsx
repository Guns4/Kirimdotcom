'use client';

import { useState, useEffect } from 'react';
import { createApiKey, revokeApiKey, deleteApiKey, getKeys } from '@/app/actions/developerActions';
import { Copy, Plus, Trash2, Shield, EyeOff, AlertTriangle, Key, CheckCircle2 } from 'lucide-react';

interface ApiKey {
    id: string;
    label: string;
    key_prefix: string;
    is_active: boolean;
    created_at: string;
    last_used_at?: string;
}

export default function DeveloperDashboard() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [label, setLabel] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        const data = await getKeys();
        setKeys(data);
    };

    const handleCreate = async () => {
        if (!label.trim()) {
            alert('Please enter a label for your API key');
            return;
        }

        setLoading(true);
        const res = await createApiKey(label.trim());
        setLoading(false);

        if (res.success && res.secretKey) {
            setNewKey(res.secretKey);
            setLabel('');
            loadKeys();
        } else {
            alert('Error creating key: ' + (res.error || 'Unknown error'));
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Revoke this API key? It will stop working immediately.')) return;
        const res = await revokeApiKey(id);
        if (res.success) {
            loadKeys();
        } else {
            alert('Error revoking key');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this API key? This action cannot be undone.')) return;
        const res = await deleteApiKey(id);
        if (res.success) {
            loadKeys();
        } else {
            alert('Error deleting key');
        }
    };

    const copyToClipboard = () => {
        if (newKey) {
            navigator.clipboard.writeText(newKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-indigo-600" />
                    Developer API Access
                </h1>
                <p className="text-gray-600">
                    Manage your API keys to access CekKirim services programmatically.
                </p>
            </div>

            {/* New Key Alert */}
            {newKey && (
                <div className="mb-8 bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                            <Key className="w-6 h-6 text-green-700" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-900 mb-1 flex items-center gap-2">
                                API Key Generated Successfully!
                                <CheckCircle2 className="w-5 h-5" />
                            </h3>
                            <p className="text-green-700 text-sm mb-4">
                                Save this key immediately. You'll <span className="font-bold">never see it again</span> once you close this alert.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <code className="flex-1 bg-white border border-green-300 p-3 rounded-lg font-mono text-sm break-all text-gray-900 shadow-sm">
                                    {newKey}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${copied
                                            ? 'bg-green-700 text-white'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" /> Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" /> Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setNewKey(null)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Close"
                        >
                            <EyeOff className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Create New Key Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border border-indigo-100">
                <h2 className="font-semibold text-gray-900 mb-4">Create New API Key</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        placeholder="Key Label (e.g., Production Server, Test Environment)"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !loading && !newKey && handleCreate()}
                        className="flex-1 bg-white border border-indigo-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        maxLength={50}
                    />
                    <button
                        onClick={handleCreate}
                        disabled={loading || !!newKey || !label.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-sm hover:shadow"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-5 h-5" /> Generate Key
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Keys List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-semibold text-gray-900">Your API Keys ({keys.filter(k => k.is_active).length} active)</h2>
                </div>

                <div className="divide-y divide-gray-100">
                    {keys.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No API keys yet</p>
                            <p className="text-sm mt-1">Create your first key to get started</p>
                        </div>
                    ) : (
                        keys.map((k) => (
                            <div
                                key={k.id}
                                className={`p-5 flex items-center justify-between hover:bg-gray-50 transition ${!k.is_active ? 'opacity-60 bg-gray-50' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${k.is_active ? 'bg-green-500' : 'bg-gray-400'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900">{k.label}</p>
                                            {k.is_active ? (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                    Revoked
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-mono text-xs text-gray-500 truncate">
                                            {k.key_prefix}*************************
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Created {new Date(k.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {k.is_active && (
                                        <button
                                            onClick={() => handleRevoke(k.id)}
                                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 rounded-lg transition"
                                            title="Revoke Key"
                                        >
                                            <EyeOff className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(k.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                                        title="Delete Key Permanently"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 text-sm text-yellow-900">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold mb-1">Security Best Practices</p>
                    <ul className="space-y-1 text-yellow-800">
                        <li>• Never commit API keys to version control (Git, GitHub, etc.)</li>
                        <li>• Use environment variables to store keys in your applications</li>
                        <li>• Revoke compromised keys immediately</li>
                        <li>• Rotate keys periodically for enhanced security</li>
                    </ul>
                </div>
            </div>

            {/* Documentation Link */}
            <div className="mt-6 text-center">
                <a
                    href="/docs/api"
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm hover:underline inline-flex items-center gap-1"
                >
                    View API Documentation →
                </a>
            </div>
        </div>
    );
}
