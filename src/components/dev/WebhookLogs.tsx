'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Activity, RefreshCw } from 'lucide-react';

export default function WebhookLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const supabase = createClient();

    const fetchLogs = async () => {
        const { data } = await supabase
            .from('webhook_queue')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        if (data) setLogs(data);
    };

    useEffect(() => { fetchLogs(); }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity /> Webhook & Callback Logs
                </h3>
                <button onClick={fetchLogs} className="p-2 hover:bg-gray-100 rounded-full">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="p-3">Time</th>
                            <th className="p-3">Target URL</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Attempts</th>
                            <th className="p-3">Last Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="border-t hover:bg-gray-50">
                                <td className="p-3">{new Date(log.created_at).toLocaleTimeString()}</td>
                                <td className="p-3 font-mono text-xs truncate max-w-[200px]">{log.url}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold
                                        ${log.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                            log.status === 'FAILED' ? 'bg-orange-100 text-orange-800' :
                                                log.status === 'GAVE_UP' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}
                                    `}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="p-3">{log.attempts}/{log.max_attempts}</td>
                                <td className="p-3 text-red-500 text-xs truncate max-w-[200px]">{log.last_error || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
