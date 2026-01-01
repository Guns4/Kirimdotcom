'use client';
import React, { useState, useEffect } from 'react';
import { LifeBuoy, RefreshCw, Filter, Send } from 'lucide-react';

export default function SupportDesk({ adminKey }: { adminKey: string }) {
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [replyText, setReplyText] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter === 'urgent') params.append('priority', 'URGENT');
            if (filter === 'open') params.append('status', 'OPEN');

            const res = await fetch(`/api/admin/support/tickets?${params}`, {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets || []);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchTickets();
    }, [adminKey, filter]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;

        try {
            const res = await fetch('/api/admin/support/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    ticket_id: selectedTicket.id,
                    message: replyText,
                    update_status: 'ANSWERED'
                })
            });

            if (res.ok) {
                setReplyText('');
                fetchTickets();
                // Refresh messages for this ticket
                // In real implementation, fetch messages separately
            } else {
                alert('Failed to send reply');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-700';
            case 'ANSWERED': return 'bg-green-100 text-green-700';
            case 'RESOLVED': return 'bg-purple-100 text-purple-700';
            case 'CLOSED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="h-[calc(100vh-200px)] flex gap-6">
            {/* LEFT: Ticket List */}
            <div className="w-1/3 bg-white rounded-xl shadow border flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <LifeBuoy size={18} /> Support Tickets
                    </h3>
                    <div className="flex gap-2">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                        >
                            <option value="all">All Tickets</option>
                            <option value="urgent">Urgent Only</option>
                            <option value="open">Open Only</option>
                        </select>
                        <button
                            onClick={fetchTickets}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tickets.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No tickets yet. You're all caught up! 🎉
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-4 border-b cursor-pointer hover:bg-slate-50 transition ${selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{ticket.subject}</h4>
                                <div className="text-xs text-slate-500">
                                    <span>{ticket.users?.full_name || 'Unknown'}</span>
                                    <span className="mx-2">•</span>
                                    <span>{ticket.category}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: Ticket Detail */}
            <div className="flex-1 bg-white rounded-xl shadow border flex flex-col">
                {!selectedTicket ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <LifeBuoy size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Select a ticket to view details</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-800">{selectedTicket.subject}</h3>
                                <div className="flex gap-2">
                                    <span className={`px-3 py-1 rounded text-sm font-bold border ${getPriorityColor(selectedTicket.priority)}`}>
                                        {selectedTicket.priority}
                                    </span>
                                    <span className={`px-3 py-1 rounded text-sm font-bold ${getStatusColor(selectedTicket.status)}`}>
                                        {selectedTicket.status}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-slate-600">
                                <span className="font-bold">{selectedTicket.users?.full_name}</span>
                                <span className="mx-2">•</span>
                                <span>{selectedTicket.users?.email}</span>
                                <span className="mx-2">•</span>
                                <span>{selectedTicket.category}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                            {/* In real implementation, fetch and display messages here */}
                            <div className="text-center text-slate-400 py-8">
                                <p>Message history will appear here</p>
                                <p className="text-xs mt-2">(Implement message fetching in production)</p>
                            </div>
                        </div>

                        <form onSubmit={handleSendReply} className="p-4 border-t bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply as admin..."
                                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 transition disabled:opacity-50"
                                >
                                    <Send size={16} />
                                    Send Reply
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
