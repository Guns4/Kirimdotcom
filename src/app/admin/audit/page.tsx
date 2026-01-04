'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Shield, Search, Eye, ArrowLeft, Database, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface AuditLog {
    id: string;
    actor_id: string;
    action: string;
    target_table: string;
    record_id: string;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    ip_address: string;
    user_agent: string;
    created_at: string;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const supabase = createClient();

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (!error && data) {
            setLogs(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getActionColor = (action: string) => {
        if (action === 'DELETE') return 'text-red-600 bg-red-50';
        if (action === 'UPDATE') return 'text-amber-600 bg-amber-50';
        return 'text-green-600 bg-green-50';
    };

    const filteredLogs = logs.filter(log =>
        log.target_table.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.record_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Shield className="w-8 h-8 text-blue-600" />
                                Audit Logs
                            </h1>
                            <p className="text-gray-500">Rekaman aktivitas sensitif sistem (Immutable)</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg w-full max-w-sm">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                placeholder="Cari by Table, Action, ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full"
                            />
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                            Menampilkan {filteredLogs.length} dari {logs.length} aktivitas
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Action</th>
                                    <th className="px-6 py-3">Table</th>
                                    <th className="px-6 py-3">Record ID</th>
                                    <th className="px-6 py-3">IP Address</th>
                                    <th className="px-6 py-3">Changes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Memuat data audit...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Tidak ada data audit yang ditemukan
                                        </td>
                                    </tr>
                                ) : filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-700">
                                            {log.target_table}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {log.record_id?.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
                                            >
                                                <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Database className="w-5 h-5 text-gray-500" />
                                Change Details
                            </h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Table</p>
                                    <p className="font-mono font-bold">{selectedLog.target_table}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Record ID</p>
                                    <p className="font-mono font-bold text-sm">{selectedLog.record_id}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Actor ID</p>
                                    <p className="font-mono text-sm">{selectedLog.actor_id || 'System'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                                    <p className="font-mono text-sm">{new Date(selectedLog.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                                <div>
                                    <h4 className="text-red-600 font-bold mb-2 text-sm">OLD DATA (Sebelum)</h4>
                                    <pre className="bg-red-50 p-4 rounded-lg overflow-x-auto text-gray-700 max-h-64">
                                        {selectedLog.old_data ? JSON.stringify(selectedLog.old_data, null, 2) : 'NULL (Insert)'}
                                    </pre>
                                </div>
                                <div>
                                    <h4 className="text-green-600 font-bold mb-2 text-sm">NEW DATA (Sesudah)</h4>
                                    <pre className="bg-green-50 p-4 rounded-lg overflow-x-auto text-gray-700 max-h-64">
                                        {selectedLog.new_data ? JSON.stringify(selectedLog.new_data, null, 2) : 'NULL (Delete)'}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-gray-500 text-xs">
                                IP: {selectedLog.ip_address || 'Unknown'} | UA: {selectedLog.user_agent?.slice(0, 50) || 'Unknown'}...
                            </span>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
