'use client';
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function FraudGuard({ adminKey }: { adminKey: string }) {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ai/fraud', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setAlerts(data.alerts || []);
            }
        } catch (error) {
            console.error('Failed to fetch fraud alerts:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchAlerts();
    }, [adminKey]);

    const handleAction = async (alertId: string, action: string) => {
        const confirmMsg = action === 'APPROVE'
            ? 'Release this transaction? (Allow it to proceed)'
            : 'Reject and ban user? (Refund and block account)';

        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch('/api/admin/ai/fraud', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    alert_id: alertId,
                    action,
                    notes: action === 'APPROVE' ? 'Manually approved by admin' : 'Flagged as fraud, user banned'
                })
            });

            if (res.ok) {
                alert(`✅ Transaction ${action.toLowerCase()}d!`);
                fetchAlerts();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const getRiskColor = (score: number) => {
        if (score >= 90) return 'bg-red-500';
        if (score >= 80) return 'bg-orange-500';
        return 'bg-yellow-500';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Shield size={20} className="text-red-600" />
                        High-Risk Transaction Monitor
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                        AI detected {alerts.length} suspicious transactions requiring review
                    </p>
                </div>
            </div>

            {/* ALERTS TABLE */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-4 text-left">Risk Score</th>
                            <th className="p-4 text-left">Transaction</th>
                            <th className="p-4 text-left">Amount</th>
                            <th className="p-4 text-left">Risk Factors</th>
                            <th className="p-4 text-left">AI Verdict</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {alerts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                    <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
                                    No high-risk transactions detected
                                </td>
                            </tr>
                        ) : (
                            alerts.map((alert) => (
                                <tr key={alert.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16">
                                                <div className="text-xs text-slate-500 mb-1">
                                                    {alert.risk_score}/100
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${getRiskColor(alert.risk_score)} ${alert.risk_score >= 90 ? 'animate-pulse' : ''
                                                            }`}
                                                        style={{ width: `${alert.risk_score}%` }}
                                                    />
                                                </div>
                                            </div>
                                            {alert.risk_score >= 90 && (
                                                <AlertTriangle size={16} className="text-red-600 animate-bounce" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">
                                            {alert.transaction_type}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            User ID: {alert.user_id?.substring(0, 8)}...
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-red-600">
                                            {formatCurrency(alert.amount)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(alert.risk_factors || []).map((factor: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold"
                                                >
                                                    {factor}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${alert.ai_verdict === 'BLOCK'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}
                                        >
                                            {alert.ai_verdict}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(alert.id, 'APPROVE')}
                                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                                                title="Release (Safe)"
                                            >
                                                <CheckCircle size={14} />
                                                <span className="text-xs font-bold">Release</span>
                                            </button>
                                            <button
                                                onClick={() => handleAction(alert.id, 'REJECT')}
                                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                                                title="Ban User"
                                            >
                                                <XCircle size={14} />
                                                <span className="text-xs font-bold">Ban</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* INFO */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-sm text-red-800">
                <strong>🛡️ Fraud Detection:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>AI monitors all transactions for suspicious patterns</li>
                    <li>Risk score >80 requires manual review</li>
                    <li>"Release" = Allow transaction to proceed</li>
                    <li>"Ban" = Refund amount and block user account</li>
                </ul>
            </div>
        </div>
    );
}
