'use client';
import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function SettingsManager({ adminKey }: { adminKey: string }) {
    const [config, setConfig] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [ratioValue, setRatioValue] = useState(70);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
                setRatioValue(parseInt(data.ADSENSE_RATIO || '70'));
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData(e.currentTarget);

        const payload = {
            ADSENSE_PUB_ID: formData.get('ADSENSE_PUB_ID'),
            ADSENSE_RATIO: formData.get('ADSENSE_RATIO'),
            SITE_NAME: formData.get('SITE_NAME')
        };

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('✅ Settings saved successfully!');
                fetchConfig();
            } else {
                alert('❌ Failed to save settings');
            }
        } catch (error) {
            alert('❌ Error: ' + error);
        }

        setSaving(false);
    };

    return (
        <div className="max-w-4xl">
            <div className="bg-white p-8 rounded-xl shadow border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings /> System Configuration
                    </h3>
                    <button
                        onClick={fetchConfig}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* GOOGLE ADSENSE SETTINGS */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                            🤖 Google AdSense Configuration
                        </h4>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-blue-700 mb-1">
                                PUBLISHER ID (ca-pub-xxx)
                            </label>
                            <input
                                name="ADSENSE_PUB_ID"
                                defaultValue={config.ADSENSE_PUB_ID}
                                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="ca-pub-0000000000000000"
                            />
                            <p className="text-xs text-blue-600 mt-1">
                                Get this from your Google AdSense dashboard
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-blue-700 mb-2">
                                TRAFFIC DISTRIBUTION (Google vs Internal)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    name="ADSENSE_RATIO"
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={ratioValue}
                                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                    onChange={(e) => setRatioValue(parseInt(e.target.value))}
                                />
                                <div className="w-40 text-right">
                                    <div className="font-black text-2xl text-blue-900">
                                        {ratioValue}%
                                    </div>
                                    <div className="text-xs text-blue-600">Google</div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-white rounded border border-blue-200">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-blue-700 font-bold">Google AdSense</div>
                                        <div className="text-3xl font-black text-blue-900">{ratioValue}%</div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            Stable revenue, auto-fill
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-purple-700 font-bold">Internal/Affiliate</div>
                                        <div className="text-3xl font-black text-purple-900">{100 - ratioValue}%</div>
                                        <div className="text-xs text-purple-600 mt-1">
                                            High margin, manual control
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-blue-500 mt-3">
                                💡 <strong>Example:</strong> At 70%, 7 out of 10 visitors see Google AdSense.
                                The remaining 3 see your affiliate/internal ads with higher margins.
                            </p>
                        </div>
                    </div>

                    {/* GENERAL SETTINGS */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-4">🌐 General Information</h4>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">
                                WEBSITE NAME
                            </label>
                            <input
                                name="SITE_NAME"
                                defaultValue={config.SITE_NAME}
                                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="YourSite.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'SAVING...' : 'UPDATE SETTINGS'}
                    </button>
                </form>
            </div>

            {/* USAGE GUIDE */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border mt-6">
                <h4 className="font-bold text-slate-800 mb-3">📖 How to Use Hybrid Ads</h4>
                <div className="space-y-2 text-sm text-slate-700">
                    <p>
                        <strong>1. Set Google AdSense ID:</strong> Enter your <code className="bg-white px-1 py-0.5 rounded">ca-pub-xxx</code> from AdSense dashboard
                    </p>
                    <p>
                        <strong>2. Adjust Ratio:</strong> Slide to control traffic split (recommended: 70% Google for stable income)
                    </p>
                    <p>
                        <strong>3. Embed Component:</strong> Use <code className="bg-white px-1 py-0.5 rounded">&lt;HybridAdSpot /&gt;</code> in your pages
                    </p>
                    <p>
                        <strong>4. Monitor Results:</strong> Check both AdSense dashboard and Monetization tab for total revenue
                    </p>
                </div>
            </div>
        </div>
    );
}
