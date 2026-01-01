'use client';
import React, { useState, useEffect } from 'react';
import { Key, Users, RefreshCw, Plus, Ban, Copy, Check } from 'lucide-react';

export default function SaaSManager({ adminKey }: { adminKey: string }) {
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [copiedKey, setCopiedKey] = useState('');

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/saas/manage', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setKeys(data.keys || []);
            }
        } catch (error) {
            console.error('Failed to fetch keys:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchKeys();
    }, [adminKey]);

    const handleGenerateKey = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            user_id: formData.get('user_id'),
            plan: formData.get('plan'),
            quota_limit: parseInt(formData.get('quota_limit') as string)
        };

        try {
            const res = await fetch('/api/admin/saas/manage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                alert('✅ API Key Generated!\n\nKey: ' + data.key.key);
                setShowForm(false);
                fetchKeys();
                e.currentTarget.reset();
            } else {
                alert('❌ Failed to generate key');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleRevokeKey = async (keyId: string) => {
        if (!confirm('Revoke this API key? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/saas/manage?id=${keyId}`, {
                method: 'DELETE',
                headers: { 'x-admin-secret': adminKey }
            });

            if (res.ok) {
                alert('✅ Key revoked');
                fetchKeys();
            } else {
                alert('❌ Failed to revoke key');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(''), 2000);
    };

    const getQuotaPercentage = (used: number, limit: number) => {
        return Math.min((used / limit) * 100, 100);
    };

    const getQuotaColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const totalKeys = keys.length;
    const activeKeys = keys.filter(k => k.is_active).length;
    const totalQuotaUsed = keys.reduce((acc, k) => acc + (k.quota_used || 0), 0);

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-blue-800 font-bold flex items-center gap-2 text-sm">
                        <Key size={16} /> Total API Keys
                    </h4>
                    <p className="text-3xl font-black text-blue-900 mt-1">{totalKeys}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h4 className="text-green-800 font-bold flex items-center gap-2 text-sm">
                        <Users size={16} /> Active Developers
                    </h4>
                    <p className="text-3xl font-black text-green-900 mt-1">{activeKeys}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="text-purple-800 font-bold flex items-center gap-2 text-sm">
                        Total API Calls
                    </h4>
                    <p className="text-3xl font-black text-purple-900 mt-1">
                        {totalQuotaUsed.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">SaaS B2B API Keys</h3>
                <div className="flex gap-2">
                    <button
                        onClick={fetchKeys}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={16} />
                        Generate New Key
                    </button>
                </div>
            </div>

            {/* FORM */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow border">
                    <h4 className="font-bold mb-4">Generate New API Key</h4>
                    <form onSubmit={handleGenerateKey} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                User ID (UUID)
                            </label>
                            <input
                                name="user_id"
                                required
                                placeholder="Enter user UUID"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Plan</label>
                                <select
                                    name="plan"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="FREE">FREE (1,000 calls/month)</option>
                                    <option value="PRO">PRO (10,000 calls/month)</option>
                                    <option value="ENTERPRISE">ENTERPRISE (Unlimited)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Quota Limit</label>
                                <input
                                    name="quota_limit"
                                    type="number"
                                    defaultValue={1000}
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Generate Key
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4 text-left">Developer</th>
                                <th className="p-4 text-left">API Key</th>
                                <th className="p-4 text-left">Plan</th>
                                <th className="p-4 text-left">Usage</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {keys.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        No API keys yet. Generate one to get started!
                                    </td>
                                </tr>
                            ) : (
                                keys.map((key) => {
                                    const percentage = getQuotaPercentage(key.quota_used || 0, key.quota_limit || 1000);
                                    return (
                                        <tr key={key.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">
                                                    {key.users?.full_name || 'Unknown'}
                                                </div>
                                                <div className="text-xs text-slate-500">{key.users?.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                                                        {key.key.substring(0, 20)}...
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(key.key)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        {copiedKey === key.key ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-bold ${key.plan === 'PRO'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : key.plan === 'ENTERPRISE'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {key.plan}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="w-48">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-bold">
                                                            {key.quota_used?.toLocaleString() || 0} / {key.quota_limit?.toLocaleString()}
                                                        </span>
                                                        <span className="text-slate-500">{Math.round(percentage)}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${getQuotaColor(percentage)}`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {key.is_active ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                        ACTIVE
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                                        REVOKED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {key.is_active && (
                                                    <button
                                                        onClick={() => handleRevokeKey(key.id)}
                                                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                                        title="Revoke Key"
                                                    >
                                                        <Ban size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
