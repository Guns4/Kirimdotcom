'use client';
import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, X, CheckCircle, Clock } from 'lucide-react';

export default function ProblematicShipment({ adminKey }: { adminKey: string }) {
    const [issues, setIssues] = useState<any[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const params = filter !== 'ALL' ? `?status=${filter}` : '?status=OPEN';
            const res = await fetch(`/api/admin/logistics/issues${params}`, {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setIssues(data.issues || []);
            }
        } catch (error) {
            console.error('Failed to fetch issues:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchIssues();
    }, [adminKey, filter]);

    const handleResolve = async (issueId: string) => {
        const compensation = prompt('Resolusi issue?\nMasukkan nominal kompensasi (0 jika tidak ada):');
        if (compensation === null) return;

        try {
            const res = await fetch('/api/admin/logistics/issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    issue_id: issueId,
                    action: 'RESOLVE',
                    compensation_amount: parseFloat(compensation) || 0,
                    resolution_notes: 'Resolved by admin'
                })
            });

            if (res.ok) {
                alert('✅ Issue resolved!');
                fetchIssues();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const getIssueIcon = (type: string) => {
        switch (type) {
            case 'LOST': return <X size={20} className="text-red-600" />;
            case 'STUCK': return <Clock size={20} className="text-orange-600" />;
            case 'RTS': return <Package size={20} className="text-purple-600" />;
            case 'BROKEN': return <AlertTriangle size={20} className="text-red-600" />;
            default: return <Package size={20} className="text-slate-600" />;
        }
    };

    const issueTypes = ['ALL', 'STUCK', 'RTS', 'LOST', 'BROKEN'];
    const lostCount = issues.filter(i => i.issue_type === 'LOST').length;
    const stuckCount = issues.filter(i => i.issue_type === 'STUCK').length;
    const rtsCount = issues.filter(i => i.issue_type === 'RTS').length;

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="text-orange-600 font-bold text-sm">Paket Stuck</div>
                    <div className="text-3xl font-black text-orange-900 mt-1">{stuckCount}</div>
                    <div className="text-xs text-orange-600 mt-1">&gt;3 hari tidak bergerak</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-purple-600 font-bold text-sm">Retur (RTS)</div>
                    <div className="text-3xl font-black text-purple-900 mt-1">{rtsCount}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="text-red-600 font-bold text-sm">Paket Hilang</div>
                    <div className="text-3xl font-black text-red-900 mt-1">{lostCount}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-blue-600 font-bold text-sm">Total Issues</div>
                    <div className="text-3xl font-black text-blue-900 mt-1">{issues.length}</div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 flex-wrap">
                {issueTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm ${filter === type
                                ? 'bg-red-600 text-white'
                                : 'bg-white border hover:bg-slate-50'
                            }`}
                    >
                        {type === 'ALL' ? 'Semua' : type}
                    </button>
                ))}
            </div>

            {/* ISSUES LIST */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="p-4 bg-slate-50 border-b font-bold flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-600" />
                    Paket Bermasalah ({issues.length})
                </div>
                <div className="divide-y divide-slate-100">
                    {issues.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
                            <div className="font-bold">Tidak ada issue!</div>
                            <div className="text-sm">Semua pengiriman lancar</div>
                        </div>
                    ) : (
                        issues.map((issue) => (
                            <div key={issue.id} className="p-4 hover:bg-slate-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getIssueIcon(issue.issue_type)}
                                            <span className="font-bold text-slate-800">
                                                Resi: {issue.tracking_number}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded text-xs font-bold ${issue.issue_type === 'LOST'
                                                        ? 'bg-red-100 text-red-700'
                                                        : issue.issue_type === 'STUCK'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : issue.issue_type === 'RTS'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {issue.issue_type}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                via {issue.courier_configs?.name || issue.courier_code}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-600 mb-2">
                                            {issue.description || 'No description'}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Reported: {new Date(issue.created_at).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {issue.resolution_status === 'OPEN' && (
                                            <>
                                                <button
                                                    onClick={() => handleResolve(issue.id)}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-bold"
                                                >
                                                    Resolve
                                                </button>
                                                {issue.issue_type === 'LOST' && (
                                                    <button
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-bold"
                                                    >
                                                        Klaim Asuransi
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* INFO */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-sm text-red-800">
                <strong>⚠️ Handling Problematic Shipments:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li><strong>STUCK:</strong> Hubungi kurir, minta update tracking</li>
                    <li><strong>RTS (Return to Sender):</strong> Customer tolak, balik ke seller</li>
                    <li><strong>LOST:</strong> Klaim asuransi jika ada, kompensasi customer</li>
                    <li><strong>BROKEN:</strong> Dokumentasi foto, klaim asuransi</li>
                    <li>Resolusi = Berikan kompensasi atau refund ke customer</li>
                </ul>
            </div>
        </div>
    );
}
