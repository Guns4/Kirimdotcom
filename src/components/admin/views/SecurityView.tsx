'use client';
import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function SecurityView({ adminKey }: { adminKey: string }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/logs/security', {
                    headers: { 'x-admin-secret': adminKey }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            }
            setLoading(false);
        };

        if (adminKey) {
            fetchLogs();
            // Auto-refresh every 30 seconds
            const interval = setInterval(fetchLogs, 30000);
            return () => clearInterval(interval);
        }
    }, [adminKey]);

    const criticalCount = logs.filter(l => l.level === 'CRITICAL').length;
    const warningCount = logs.filter(l => l.level === 'WARNING').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded border border-red-100 flex items-center gap-3">
                    <AlertTriangle className="text-red-600" />
                    <div>
                        <h4 className="font-bold text-red-800">Critical Events</h4>
                        <p className="text-xs text-red-600">{criticalCount} in last 50 logs</p>
                    </div>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-100 flex items-center gap-3">
                    <Activity className="text-blue-600" />
                    <div>
                        <h4 className="font-bold text-blue-800">System Pulse</h4>
                        <p className="text-xs text-blue-600">Monitoring Active</p>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded border border-green-100 flex items-center gap-3">
                    <ShieldCheck className="text-green-600" />
                    <div>
                        <h4 className="font-bold text-green-800">Firewall Status</h4>
                        <p className="text-xs text-green-600">Active (Rate Limit ON)</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-slate-900 text-white font-mono text-sm flex justify-between items-center">
                    <span>&gt; SYSTEM_LOGS.tail(50)</span>
                    {loading && <span className="text-blue-400 text-xs">Refreshing...</span>}
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-500 uppercase text-xs sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Level</th>
                                <th className="px-6 py-3">Event</th>
                                <th className="px-6 py-3">Message</th>
                                <th className="px-6 py-3">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-xs">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        {loading ? 'Loading logs...' : 'No security logs found'}
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-slate-500">
                                            {log.created_at ? format(new Date(log.created_at), 'dd/MM HH:mm:ss') : '-'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.level === 'CRITICAL' ? 'bg-red-600 text-white' :
                                                    log.level === 'WARNING' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-50 text-blue-600'
                                                }`}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-bold text-slate-700">{log.event_type}</td>
                                        <td className="px-6 py-3 text-slate-600">{log.message}</td>
                                        <td className="px-6 py-3 text-slate-400">{log.ip_address || '-'}</td>
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
