'use client';
import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, RotateCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function WebhookMonitor({ adminKey }: { adminKey: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('failed');
    const [retrying, setRetrying] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = filter === 'failed' ? '?failed=true' : '';
            const res = await fetch(`/api/admin/system/webhooks${params}`, {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchLogs();
    }, [adminKey, filter]);

    const handleRetry = async (logId: string) => {
        setRetrying(logId);
        try {
            const res = await fetch('/api/admin/system/webhooks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({ log_id: logId, action: 'retry' })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    alert('✅ Webhook delivered successfully!');
                } else {
                    alert('❌ Webhook retry failed: ' + data.message);
                }
                fetchLogs();
            } else {
                alert('Failed to retry webhook');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
        setRetrying(null);
    };

    const getStatusColor = (statusCode: number | null) => {
        if (!statusCode || statusCode === 0) return 'text-red-600';
        if (statusCode >= 200 && statusCode < 300) return 'text-green-600';
        if (statusCode >= 400 && statusCode < 500) return 'text-orange-600';
        return 'text-red-600';
    };

    const getStatusIcon = (statusCode: number | null) => {
        if (!statusCode || statusCode === 0) return <AlertCircle size={16} className="text-red-600" />;
        if (statusCode >= 200 && statusCode < 300) return <CheckCircle size={16} className="text-green-600" />;
        return <AlertCircle size={16} className="text-orange-600" />;
    };

    const failedCount = logs.filter(l => !l.status_code || l.status_code < 200 || l.status_code >= 300).length;
    const successCount = logs.filter(l => l.status_code >= 200 && l.status_code < 300).length;

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <h4 className="text-red-800 font-bold flex items-center gap-2 text-sm">
                        <AlertCircle size={16} /> Failed Webhooks
                    </h4>
                    <p className="text-3xl font-black text-red-900 mt-1">{failedCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h4 className="text-green-800 font-bold flex items-center gap-2 text-sm">
                        <CheckCircle size={16} /> Successful
                    </h4>
                    <p className="text-3xl font-black text-green-900 mt-1">{successCount}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-blue-800 font-bold flex items-center gap-2 text-sm">
                        <Cpu size={16} /> Total Attempts
                    </h4>
                    <p className="text-3xl font-black text-blue-900 mt-1">{logs.length}</p>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Webhook Delivery Monitor</h3>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                    >
                        <option value="failed">Failed Only</option>
                        <option value="all">All Logs</option>
                    </select>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4 text-left">Developer</th>
                                <th className="p-4 text-left">Endpoint URL</th>
                                <th className="p-4 text-left">Event</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Attempts</th>
                                <th className="p-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        {filter === 'failed'
                                            ? '🎉 No failed webhooks! All systems operational.'
                                            : 'No webhook logs yet.'}
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">
                                                {log.users?.full_name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-slate-500">{log.users?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                                                {log.endpoint_url}
                                            </code>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                {log.event_type || 'manual'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(log.status_code)}
                                                <span className={`font-mono font-bold ${getStatusColor(log.status_code)}`}>
                                                    {log.status_code || 'FAILED'}
                                                </span>
                                            </div>
                                            {log.response_body && (
                                                <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">
                                                    {log.response_body}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-slate-600 font-bold">
                                                {log.attempt_count || 1}×
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleRetry(log.id)}
                                                disabled={retrying === log.id}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-bold disabled:opacity-50"
                                            >
                                                <RotateCw size={12} className={retrying === log.id ? 'animate-spin' : ''} />
                                                {retrying === log.id ? 'Retrying...' : 'Retry Now'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* HELP TEXT */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> If a client reports "webhook not received", click "Retry Now" to manually
                trigger delivery. Check the status code to diagnose: <strong>200</strong> = Success, <strong>404</strong> = Wrong URL,
                <strong>500</strong> = Client server error, <strong>0</strong> = Network/DNS issue.
            </div>
        </div>
    );
}
