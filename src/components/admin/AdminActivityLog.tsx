'use client';
import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, User, Clock } from 'lucide-react';

export default function AdminActivityLog({ adminKey }: { adminKey: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/system/audit', {
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
    }, [adminKey]);

    const getActionColor = (action: string) => {
        if (action.includes('TOGGLE') || action.includes('EXPORT')) return 'bg-blue-100 text-blue-700';
        if (action.includes('DELETE') || action.includes('BAN')) return 'bg-red-100 text-red-700';
        if (action.includes('APPROVE') || action.includes('CREATE')) return 'bg-green-100 text-green-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <ScrollText size={18} /> Admin Activity Log
                </h4>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Action</th>
                                <th className="p-3 text-left">Details</th>
                                <th className="p-3 text-left">Time</th>
                                <th className="p-3 text-left">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">
                                        No activity logs yet
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-600">
                                            {log.details && (
                                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                    {JSON.stringify(log.details)}
                                                </code>
                                            )}
                                        </td>
                                        <td className="p-3 text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span className="text-xs">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <code className="text-xs text-slate-500">{log.ip_address || 'N/A'}</code>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
