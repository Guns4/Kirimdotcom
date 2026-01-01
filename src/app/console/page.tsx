'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==========================================
// Developer Console
// API Key Management & Analytics Dashboard
// ==========================================

export default function ConsolePage() {
    const [user, setUser] = useState<any>(null);
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [usage Stats, setUsageStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            window.location.href = '/login?redirect=/console';
            return;
        }

        setUser(user);
        await fetchData(user.id);
    };

    const fetchData = async (userId: string) => {
        setLoading(true);
        try {
            // Fetch API keys
            const { data: keys } = await supabase
                .from('saas_api_keys')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true);

            setApiKeys(keys || []);

            // Fetch usage stats
            const res = await fetch(`/api/console/stats?user_id=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUsageStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateApiKey = async () => {
        if (!user) return;

        setGenerating(true);
        try {
            const res = await fetch('/api/console/generate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id }),
            });

            if (res.ok) {
                await fetchData(user.id);
                alert('✅ API Key generated successfully!');
            } else {
                const error = await res.json();
                alert(`❌ Error: ${error.error}`);
            }
        } catch (error) {
            alert('Failed to generate API key');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('✅ Copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-4xl font-black mb-2">🖥️ Developer Console</h1>
                    <p className="text-blue-100">Manage your API keys and monitor usage</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Overview */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                        <p className="text-3xl font-black text-blue-600">{usageStats?.total_requests || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">This Month</p>
                        <p className="text-3xl font-black text-green-600">{usageStats?.month_requests || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                        <p className="text-3xl font-black text-purple-600">{usageStats?.success_rate || 100}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Avg Response</p>
                        <p className="text-3xl font-black text-orange-600">{usageStats?.avg_response_time || 150}ms</p>
                    </div>
                </div>

                {/* API Keys Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black">🔑 API Keys</h2>
                        <button
                            onClick={generateApiKey}
                            disabled={generating || apiKeys.length >= 3}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generating ? '⏳ Generating...' : '➕ Generate New Key'}
                        </button>
                    </div>

                    {apiKeys.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <div className="text-6xl mb-4">🔐</div>
                            <p className="text-gray-600 mb-4">No API keys yet. Generate your first key to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {apiKeys.map((key) => (
                                <div key={key.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-bold text-gray-700">{key.key_name || 'API Key'}</span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {key.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 px-4 py-2 rounded font-mono text-sm text-gray-800 flex-1">
                                                    {key.api_key}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(key.api_key)}
                                                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm font-bold"
                                                >
                                                    📋 Copy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <div>
                                            <span className="font-semibold">Requests:</span> {key.request_count || 0}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Quota:</span> {key.quota_limit || 'Unlimited'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Created:</span> {new Date(key.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Start Guide */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
                    <h2 className="text-2xl font-black mb-4">🚀 Quick Start</h2>
                    <p className="text-gray-700 mb-4">Use your API key to make requests:</p>
                    <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto font-mono text-sm">
                        {`curl -X POST https://cekkirim.com/api/v1/shipping/cost \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": "Jakarta",
    "destination": "Surabaya",
    "weight": 1000,
    "courier": "jne"
  }'`}
                    </pre>
                    <div className="mt-6 flex gap-4">
                        <a
                            href="/docs/api"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                        >
                            📖 Full Documentation
                        </a>
                        <a
                            href="/business#demo"
                            className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50"
                        >
                            🎯 Try Interactive Demo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
