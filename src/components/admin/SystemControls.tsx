'use client';
import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Power, AlertTriangle } from 'lucide-react';

export default function SystemControls({ adminKey }: { adminKey: string }) {
    const [flags, setFlags] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/system/flags', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setFlags(data.flags || []);
            }
        } catch (error) {
            console.error('Failed to fetch flags:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchFlags();
    }, [adminKey]);

    const handleToggle = async (flagKey: string, currentState: boolean) => {
        const newState = !currentState;

        // Confirmation for critical flags
        const criticalFlags = ['GLOBAL_MAINTENANCE', 'ENABLE_TOPUP', 'ENABLE_WITHDRAW'];
        if (criticalFlags.includes(flagKey)) {
            const action = newState ? 'ENABLE' : 'DISABLE';
            const confirm = window.confirm(
                `⚠️ Are you sure you want to ${action} ${flagKey}?\n\nThis will ${newState ? 'activate' : 'deactivate'} the feature immediately.`
            );
            if (!confirm) return;
        }

        setToggling(flagKey);
        try {
            const res = await fetch('/api/admin/system/flags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    flag_key: flagKey,
                    is_enabled: newState
                })
            });

            if (res.ok) {
                fetchFlags();
            } else {
                alert('Failed to toggle flag');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
        setToggling(null);
    };

    const getStatusColor = (isEnabled: boolean) => {
        return isEnabled ? 'bg-green-500' : 'bg-gray-300';
    };

    const getStatusText = (isEnabled: boolean) => {
        return isEnabled ? 'ENABLED' : 'DISABLED';
    };

    const getFlagIcon = (key: string) => {
        if (key.includes('MAINTENANCE')) return <AlertTriangle className="text-orange-600" size={24} />;
        return <Power className="text-blue-600" size={24} />;
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Sliders size={24} /> System Kill Switches
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Emergency controls to enable/disable features instantly
                    </p>
                </div>
                <button
                    onClick={fetchFlags}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* WARNING BANNER */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <div className="flex items-center gap-2 text-orange-800 font-bold mb-1">
                    <AlertTriangle size={18} />
                    Caution: Emergency Controls
                </div>
                <p className="text-sm text-orange-700">
                    These switches instantly affect all users. Use with care, especially during business hours.
                </p>
            </div>

            {/* FEATURE FLAGS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flags.map((flag) => (
                    <div
                        key={flag.key}
                        className={`bg-white p-6 rounded-xl shadow border-2 transition ${flag.is_enabled ? 'border-green-200' : 'border-gray-200'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {getFlagIcon(flag.key)}
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">
                                        {flag.key.replace(/_/g, ' ')}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">{flag.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* iOS-Style Toggle */}
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${flag.is_enabled ? 'text-green-700' : 'text-gray-500'}`}>
                                {getStatusText(flag.is_enabled)}
                            </span>
                            <button
                                onClick={() => handleToggle(flag.key, flag.is_enabled)}
                                disabled={toggling === flag.key}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${toggling === flag.key ? 'opacity-50 cursor-wait' : ''
                                    } ${getStatusColor(flag.is_enabled)}`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${flag.is_enabled ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Last Updated */}
                        {flag.updated_at && (
                            <div className="mt-3 pt-3 border-t text-xs text-slate-400">
                                Last changed: {new Date(flag.updated_at).toLocaleString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* USAGE GUIDE */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <strong>💡 Common Scenarios:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li><strong>Midtrans Down?</strong> → Disable "ENABLE TOPUP" until fixed</li>
                    <li><strong>SMM Provider Maintenance?</strong> → Disable "ENABLE SMM ORDER"</li>
                    <li><strong>Emergency Bug?</strong> → Enable "GLOBAL MAINTENANCE"</li>
                    <li><strong>High Traffic Attack?</strong> → Disable "ENABLE REGISTRATION" temporarily</li>
                </ul>
            </div>
        </div>
    );
}
