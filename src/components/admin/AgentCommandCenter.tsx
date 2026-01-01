'use client';
import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, DollarSign, RefreshCw } from 'lucide-react';

export default function AgentCommandCenter({ adminKey }: { adminKey: string }) {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('PENDING');

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const params = filter !== 'ALL' ? `?status=${filter}` : '';
            const res = await fetch(`/api/admin/o2o/agents${params}`, {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setAgents(data.agents || []);
            }
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchAgents();
    }, [adminKey, filter]);

    const handleAction = async (agentId: string, action: string) => {
        const confirmMsg = `${action} this agent?`;
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch('/api/admin/o2o/agents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({ agent_id: agentId, action })
            });

            if (res.ok) {
                alert(`✅ Agent ${action.toLowerCase()}d!`);
                fetchAgents();
            } else {
                alert('Failed to perform action');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const pendingCount = agents.filter(a => a.status === 'PENDING').length;
    const activeCount = agents.filter(a => a.status === 'ACTIVE').length;
    const totalBalance = agents
        .filter(a => a.status === 'ACTIVE')
        .reduce((acc, a) => acc + (parseFloat(a.pos_balance) || 0), 0);

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="text-orange-600 font-bold text-sm">Pending Approval</div>
                    <div className="text-3xl font-black text-orange-900 mt-1">{pendingCount}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-green-600 font-bold text-sm">Active Agents</div>
                    <div className="text-3xl font-black text-green-900 mt-1">{activeCount}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-blue-600 font-bold text-sm">Total Network</div>
                    <div className="text-3xl font-black text-blue-900 mt-1">{agents.length}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-purple-600 font-bold text-sm">Total POS Balance</div>
                    <div className="text-2xl font-black text-purple-900 mt-1">
                        {formatCurrency(totalBalance)}
                    </div>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Store size={24} /> Agent Network Command Center
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage O2O agent network and approval queue
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="ALL">All Agents</option>
                        <option value="PENDING">Pending Only</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                    <button
                        onClick={fetchAgents}
                        disabled={loading}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* AGENT LIST */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-4 text-left">Agent</th>
                            <th className="p-4 text-left">Code</th>
                            <th className="p-4 text-left">Location</th>
                            <th className="p-4 text-left">POS Balance</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {agents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                    No agents found
                                </td>
                            </tr>
                        ) : (
                            agents.map((agent) => {
                                const balance = parseFloat(agent.pos_balance) || 0;
                                const lowBalance = balance < 100000; // Less than 100K

                                return (
                                    <tr key={agent.id} className="hover:bg-slate-50">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">
                                                {agent.business_name || 'Unnamed'}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {agent.users?.full_name} • {agent.users?.email}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                                                {agent.agent_code}
                                            </code>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-slate-600">
                                                {agent.location_address || 'Not set'}
                                            </div>
                                            {agent.location_lat && (
                                                <div className="text-xs text-slate-400">
                                                    {agent.location_lat}, {agent.location_long}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className={`font-bold ${lowBalance ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(balance)}
                                            </div>
                                            {lowBalance && agent.status === 'ACTIVE' && (
                                                <div className="text-xs text-red-500">⚠️ Low balance</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-bold ${agent.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-700'
                                                        : agent.status === 'PENDING'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : agent.status === 'SUSPENDED'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {agent.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {agent.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(agent.id, 'APPROVE')}
                                                            className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(agent.id, 'REJECT')}
                                                            className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {agent.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleAction(agent.id, 'SUSPEND')}
                                                        className="p-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-xs font-bold"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* INFO */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800">
                <strong>💡 Agent Network Tips:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Approve agents after verifying KYC documents</li>
                    <li>Monitor agents with low POS balance (red flag)</li>
                    <li>Suspend agents for violations or fraud</li>
                    <li>Agent commission: {agents[0]?.commission_rate || 2.5}% per transaction</li>
                </ul>
            </div>
        </div>
    );
}
