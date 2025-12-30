'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { Search, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { CANNED_RESPONSES } from '@/config/canned-responses';
import { toast } from 'sonner';

export default function TicketInbox() {
    const supabase = createClient();
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch Tickets
    useEffect(() => {
        fetchTickets();

        // Realtime Subscription for new tickets
        const channel = supabase
            .channel('tickets-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
                fetchTickets();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Fetch Messages when ticket selected
    useEffect(() => {
        if (!selectedId) return;
        fetchMessages(selectedId);
    }, [selectedId]);

    const fetchTickets = async () => {
        const { data } = await supabase
            .from('support_tickets')
            .select('*, user:user_id(email)') // simplified join
            .order('updated_at', { ascending: false });
        if (data) setTickets(data);
        setLoading(false);
    };

    const fetchMessages = async (ticketId: string) => {
        const { data } = await supabase
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
        if (data) setMessages(data);
    };

    const sendReply = async () => {
        if (!reply.trim() || !selectedId) return;

        const { data: { user } } = await supabase.auth.getUser();

        // 1. Insert Message
        const { error } = await supabase.from('support_messages').insert({
            ticket_id: selectedId,
            sender_id: user?.id,
            role: 'ADMIN',
            content: reply
        });

        if (error) {
            toast.error('Failed to send');
            return;
        }

        // 2. Update Ticket Status
        await supabase.from('support_tickets').update({
            status: 'REPLIED',
            updated_at: new Date().toISOString()
        }).eq('id', selectedId);

        setReply('');
        fetchMessages(selectedId);
        fetchTickets(); // Refresh list order
        toast.success('Reply sent');
    };

    const handleCanned = (content: string) => {
        setReply(content);
    };

    const resolveTicket = async () => {
        if (!selectedId) return;
        await supabase.from('support_tickets').update({ status: 'CLOSED' }).eq('id', selectedId);
        toast.success('Ticket Closed');
        fetchTickets();
    };

    const selectedTicket = tickets.find(t => t.id === selectedId);

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white border rounded-xl overflow-hidden shadow-sm">
            {/* Left: Ticket List */}
            <div className="w-1/3 border-r bg-gray-50 flex flex-col">
                <div className="p-4 border-b bg-white">
                    <h2 className="font-semibold text-gray-800 mb-2">Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {loading ? <div className="p-4 text-center text-xs text-gray-400">Loading...</div> : tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedId(ticket.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${selectedId === ticket.id ? 'bg-white border-blue-500 shadow-md' : 'bg-white border-transparent hover:border-gray-200'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                                        ticket.status === 'REPLIED' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                    }`}>{ticket.status}</span>
                                <span className="text-[10px] text-gray-400">{format(new Date(ticket.updated_at), 'dd MMM HH:mm')}</span>
                            </div>
                            <h3 className="font-medium text-gray-900 text-sm truncate">{ticket.subject}</h3>
                            <p className="text-xs text-gray-500 truncate">User ID: {ticket.user_id?.split('-')[0]}...</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="font-bold text-gray-900">{selectedTicket?.subject}</h2>
                                <p className="text-xs text-gray-500">Ticket ID: {selectedTicket?.id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={resolveTicket}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border rounded hover:bg-gray-50 flex items-center gap-1"
                                >
                                    <CheckCircle className="w-3 h-3" /> Mark Resolved
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-xl ${msg.role === 'ADMIN'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                                        }`}>
                                        <p className="text-sm border-white/10 whitespace-pre-wrap">{msg.content}</p>
                                        <div className={`text-[10px] mt-1 text-right ${msg.role === 'ADMIN' ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {format(new Date(msg.created_at), 'HH:mm')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-white">
                            {/* Canned Responses Pills */}
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                {CANNED_RESPONSES.map((cr, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleCanned(cr.content)}
                                        className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full border whitespace-nowrap text-gray-600 transition-colors"
                                    >
                                        {cr.title}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-20"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendReply();
                                        }
                                    }}
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={!reply.trim()}
                                    className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
