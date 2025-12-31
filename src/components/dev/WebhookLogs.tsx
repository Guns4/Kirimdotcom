'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function WebhookLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchLogs = async () => {
        setLoading(true);
        const { data } = await (supabase as any)
            .from('webhook_queue')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Webhook Delivery Logs</h3>
                <button onClick={fetchLogs} className="p-2 hover:bg-gray-100 rounded-full">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="p-3">Status</th>
                            <th className="p-3">URL</th>
                            <th className="p-3">Attempts</th>
                            <th className="p-3">Next / Last Error</th>
                            <th className="p-3">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="p-3">
                                    <Badge status={log.status} />
                                </td>
                                <td className="p-3 max-w-xs truncate font-mono text-xs">{log.url}</td>
                                <td className="p-3">{log.attempts}/{log.max_attempts}</td>
                                <td className="p-3 max-w-sm truncate text-gray-500">
                                    {log.status === 'FAILED'
                                        ? `Retry in ${formatDistanceToNow(new Date(log.next_attempt_at))}`
                                        : log.last_error || '-'}
                                </td>
                                <td className="p-3 text-gray-400">
                                    {formatDistanceToNow(new Date(log.created_at))} ago
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No logs found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Badge({ status }: { status: string }) {
    if (status === 'DELIVERED') return <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle size={14} /> Delivered</span>;
    if (status === 'GAVE_UP') return <span className="flex items-center gap-1 text-gray-500 font-bold text-xs"><XCircle size={14} /> Gave Up</span>;
    if (status === 'FAILED') return <span className="flex items-center gap-1 text-red-500 font-bold text-xs"><XCircle size={14} /> Failed</span>;
    return <span className="flex items-center gap-1 text-blue-500 font-bold text-xs"><Clock size={14} /> {status}</span>;
}
