'use client';
import React, { useState, useEffect } from 'react';
import { Smartphone, Power, AlertTriangle, Send, Bell } from 'lucide-react';

export default function MobileAppManager({ adminKey }: { adminKey: string }) {
    const [config, setConfig] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [pushTitle, setPushTitle] = useState('');
    const [pushMessage, setPushMessage] = useState('');

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/mobile/config', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                setConfig(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchConfig();
    }, [adminKey]);

    const handleUpdateConfig = async (updates: any) => {
        try {
            const res = await fetch('/api/admin/mobile/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                alert('✅ Config updated!');
                fetchConfig();
            } else {
                alert('Failed to update config');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleSendPush = async () => {
        if (!pushTitle || !pushMessage) {
            alert('Title and message required');
            return;
        }

        try {
            const res = await fetch('/api/admin/mobile/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    title: pushTitle,
                    message: pushMessage,
                    target_type: 'ALL'
                })
            });

            if (res.ok) {
                alert('✅ Notification sent (logged - FCM integration pending)');
                setPushTitle('');
                setPushMessage('');
            } else {
                alert('Failed to send notification');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Smartphone size={24} /> Mobile App Command Center
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Remote control for Android/iOS app version and maintenance
                </p>
            </div>

            {/* APP STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow border">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Power size={18} />
                        Maintenance Mode
                    </h4>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                            {config.maintenance_mode ? '🔴 App is DOWN' : '✅ App is LIVE'}
                        </span>
                        <button
                            onClick={() => {
                                const newMode = !config.maintenance_mode;
                                if (newMode && !confirm('⚠️ Enable maintenance mode?\nUsers cannot access the app!')) return;
                                handleUpdateConfig({ maintenance_mode: newMode });
                            }}
                            className={`px-4 py-2 rounded font-bold ${config.maintenance_mode
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                        >
                            {config.maintenance_mode ? 'Turn ON App' : 'Turn OFF App'}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Force Update
                    </h4>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                            {config.force_update ? '🔴 Users MUST update' : '✅ Optional update'}
                        </span>
                        <button
                            onClick={() => {
                                const newMode = !config.force_update;
                                if (newMode && !confirm('⚠️ Force update?\nOld app versions will be BLOCKED!')) return;
                                handleUpdateConfig({ force_update: newMode });
                            }}
                            className={`px-4 py-2 rounded font-bold ${config.force_update
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                }`}
                        >
                            {config.force_update ? 'Make Optional' : 'Force Update'}
                        </button>
                    </div>
                </div>
            </div>

            {/* VERSION CONTROL */}
            <div className="bg-white p-6 rounded-xl shadow border">
                <h4 className="font-bold text-slate-800 mb-4">Version Control</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">
                            Current Version
                        </label>
                        <div className="text-2xl font-black text-blue-600">
                            {config.latest_version_name || '1.0.0'}
                        </div>
                        <div className="text-xs text-slate-500">Code: {config.latest_version_code || 1}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">
                            Minimum Version
                        </label>
                        <input
                            type="number"
                            defaultValue={config.min_version_code || 1}
                            onBlur={(e) => {
                                const newMin = parseInt(e.target.value);
                                if (newMin > (config.latest_version_code || 1)) {
                                    alert('Minimum cannot exceed latest version!');
                                    return;
                                }
                                handleUpdateConfig({ min_version_code: newMin });
                            }}
                            className="w-full border rounded px-3 py-2 text-center font-bold"
                        />
                        <div className="text-xs text-slate-500 mt-1">Min code to access app</div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">
                            Store Links
                        </label>
                        <div className="space-y-1">
                            <a
                                href={config.playstore_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-600 hover:underline"
                            >
                                📱 Play Store
                            </a>
                            <a
                                href={config.appstore_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-600 hover:underline"
                            >
                                🍎 App Store
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* PUSH NOTIFICATION */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Bell size={18} className="text-purple-600" />
                    Push Notification Center
                </h4>
                <div className="space-y-3">
                    <div>
                        <input
                            type="text"
                            value={pushTitle}
                            onChange={(e) => setPushTitle(e.target.value)}
                            placeholder="Notification Title"
                            className="w-full border rounded px-3 py-2 font-bold"
                        />
                    </div>
                    <div>
                        <textarea
                            value={pushMessage}
                            onChange={(e) => setPushMessage(e.target.value)}
                            placeholder="Message content..."
                            rows={3}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <button
                        onClick={handleSendPush}
                        className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        Send to All Users
                    </button>
                    <div className="text-xs text-purple-700 text-center">
                        ⚠️ FCM Integration Required - Currently logging only
                    </div>
                </div>
            </div>

            {/* INFO */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                <strong>💡 How It Works:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li><strong>Maintenance Mode:</strong> Shows "Under Maintenance" screen in app</li>
                    <li><strong>Force Update:</strong> Blocks users below minimum version</li>
                    <li><strong>Version Control:</strong> App checks config on startup</li>
                    <li><strong>Push Notifications:</strong> Requires Firebase Cloud Messaging setup</li>
                </ul>
            </div>
        </div>
    );
}
