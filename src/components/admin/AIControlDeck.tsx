'use client';
import React, { useState, useEffect } from 'react';
import { Brain, DollarSign, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import ChatbotTrainer from './ChatbotTrainer';
import FraudGuard from './FraudGuard';

export default function AIControlDeck({ adminKey }: { adminKey: string }) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('analytics');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ai/stats', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                setStats(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch AI stats:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey && activeSubTab === 'analytics') fetchStats();
    }, [adminKey, activeSubTab]);

    const formatCost = (usd: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(usd);
    };

    const summary = stats?.summary || {};
    const totalCost = parseFloat(summary.total_cost_usd || 0);
    const monthlyEstimate = totalCost * 30; // Rough estimate

    return (
        <div className="space-y-6">
            {/* SUB-NAVIGATION */}
            <div className="bg-white rounded-lg border p-1 inline-flex gap-1">
                {['analytics', 'trainer', 'fraud'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`px-4 py-2 rounded font-bold text-sm transition ${activeSubTab === tab
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {tab === 'analytics' && '📊 Analytics'}
                        {tab === 'trainer' && '🤖 Trainer'}
                        {tab === 'fraud' && '🛡️ Fraud'}
                    </button>
                ))}
            </div>

            {activeSubTab === 'analytics' && (
                <div className="space-y-6">
                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Brain size={24} className="text-purple-600" /> AI Intelligence Center
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Monitor AI costs, token usage, and model performance
                            </p>
                        </div>
                        <button
                            onClick={fetchStats}
                            disabled={loading}
                            className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* COST STATS */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl text-white">
                            <div className="text-sm opacity-90 mb-2">Monthly Estimate</div>
                            <div className="text-3xl font-black">{formatCost(monthlyEstimate)}</div>
                            <div className="text-xs opacity-75 mt-2">OpenAI/Claude Costs</div>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <div className="text-blue-600 font-bold text-sm">Total Requests</div>
                            <div className="text-3xl font-black text-blue-900 mt-2">
                                {summary.total_requests || 0}
                            </div>
                        </div>
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                            <div className="text-green-600 font-bold text-sm">Total Tokens</div>
                            <div className="text-3xl font-black text-green-900 mt-2">
                                {(summary.total_tokens || 0).toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                            <div className="text-orange-600 font-bold text-sm">Avg Cost/Request</div>
                            <div className="text-3xl font-black text-orange-900 mt-2">
                                {formatCost(totalCost / (summary.total_requests || 1))}
                            </div>
                        </div>
                    </div>

                    {/* COST BY FEATURE */}
                    <div className="bg-white rounded-xl shadow border p-6">
                        <h4 className="font-bold text-slate-800 mb-4">Cost Breakdown by Feature</h4>
                        <div className="space-y-3">
                            {Object.entries(summary.cost_by_feature || {}).map(([feature, data]: [string, any]) => {
                                const percentage = (data.cost / totalCost) * 100;
                                return (
                                    <div key={feature}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-bold text-slate-700">{feature}</span>
                                            <span className="text-slate-600">
                                                {formatCost(data.cost)} ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full ${percentage > 50
                                                    ? 'bg-red-500'
                                                    : percentage > 30
                                                        ? 'bg-orange-500'
                                                        : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {data.requests} requests • {data.tokens.toLocaleString()} tokens
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* BUDGET ALERT */}
                    <div className={`p-4 rounded-lg border ${monthlyEstimate > 100
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : monthlyEstimate > 50
                            ? 'bg-orange-50 border-orange-200 text-orange-800'
                            : 'bg-green-50 border-green-200 text-green-800'
                        }`}>
                        <strong>💰 Budget Status:</strong>
                        <div className="mt-2 text-sm">
                            {monthlyEstimate > 100 && '⚠️ High spending! Consider switching to GPT-3.5-turbo'}
                            {monthlyEstimate > 50 && monthlyEstimate <= 100 && '⚡ Moderate usage, monitor closely'}
                            {monthlyEstimate <= 50 && '✅ Within budget, usage is efficient'}
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'trainer' && <ChatbotTrainer adminKey={adminKey} />}
            {activeSubTab === 'fraud' && <FraudGuard adminKey={adminKey} />}
        </div>
    );
}
