import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Shield, Search } from 'lucide-react';

export default async function AdminLogsPage() {
    const supabase = await createClient();

    // Fetch Logs with Admin Names
    const { data: logs, error } = await supabase
        .from('admin_activity_logs')
        .select(`
            *,
            admin:admin_profiles(full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Activity Logs</h1>
                    <p className="text-gray-500">Monitor all administrative actions for accountability.</p>
                </div>
                <div className="bg-white p-2 border rounded-lg flex items-center gap-2 text-sm text-gray-500 shadow-sm">
                    <Search className="w-4 h-4" />
                    <span>Search logs...</span>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-gray-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Admin</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Target</th>
                            <th className="px-4 py-3">Details</th>
                            <th className="px-4 py-3">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs?.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">
                                    {log.created_at ? format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss') : '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Shield className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {/* @ts-ignore */}
                                                {log.admin?.full_name || 'Unknown Admin'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {/* @ts-ignore */}
                                                {log.admin?.role || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-xs border">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {log.target || '-'}
                                </td>
                                <td className="px-4 py-3 max-w-xs truncate text-gray-500" title={JSON.stringify(log.details, null, 2)}>
                                    {JSON.stringify(log.details)}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                    {log.ip_address}
                                </td>
                            </tr>
                        ))}

                        {(!logs || logs.length === 0) && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                    No activity logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
