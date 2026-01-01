'use client';
import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsDown, Send } from 'lucide-react';

export default function ChatbotTrainer({ adminKey }: { adminKey: string }) {
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [correction, setCorrection] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchChats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/ai/training', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setChats(data.chats || []);
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchChats();
    }, [adminKey]);

    const handleCorrect = async () => {
        if (!selectedChat || !correction) return;

        try {
            const res = await fetch('/api/admin/ai/training', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify({
                    chat_id: selectedChat.id,
                    admin_correction: correction
                })
            });

            if (res.ok) {
                alert('✅ Correction saved for future training!');
                setCorrection('');
                setSelectedChat(null);
                fetchChats();
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-4 h-[600px]">
            {/* CONVERSATION LIST */}
            <div className="bg-white rounded-xl border overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b font-bold flex items-center gap-2">
                    <MessageSquare size={18} />
                    Flagged Conversations ({chats.length})
                </div>
                <div className="flex-1 overflow-y-auto divide-y">
                    {chats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full p-4 text-left hover:bg-slate-50 transition ${selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="font-bold text-sm text-slate-800 mb-1 line-clamp-1">
                                {chat.user_query}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <ThumbsDown size={12} className="text-red-500" />
                                {chat.feedback_reason || 'Unhelpful response'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CHAT DISPLAY */}
            <div className="col-span-2 bg-white rounded-xl border flex flex-col">
                {selectedChat ? (
                    <>
                        <div className="p-4 bg-slate-50 border-b font-bold">
                            Conversation Details
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {/* USER MESSAGE */}
                            <div className="flex justify-end">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-[80%]">
                                    <div className="text-xs opacity-75 mb-1">User Query</div>
                                    <div>{selectedChat.user_query}</div>
                                </div>
                            </div>

                            {/* AI RESPONSE */}
                            <div className="flex justify-start">
                                <div className="bg-slate-100 px-4 py-2 rounded-lg max-w-[80%] border-2 border-red-200">
                                    <div className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                                        <ThumbsDown size={12} className="text-red-500" />
                                        AI Response (Flagged)
                                    </div>
                                    <div className="text-slate-800">{selectedChat.ai_response}</div>
                                </div>
                            </div>

                            {/* FEEDBACK */}
                            {selectedChat.feedback_reason && (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                                    <strong>User Feedback:</strong> {selectedChat.feedback_reason}
                                </div>
                            )}
                        </div>

                        {/* CORRECTION INPUT */}
                        <div className="p-4 border-t bg-slate-50">
                            <div className="mb-2 font-bold text-sm text-slate-700">
                                ✍️ Provide Correct Answer (for training):
                            </div>
                            <textarea
                                value={correction}
                                onChange={(e) => setCorrection(e.target.value)}
                                placeholder="Type the correct response that AI should have given..."
                                rows={3}
                                className="w-full border rounded p-3 mb-2"
                            />
                            <button
                                onClick={handleCorrect}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                            >
                                <Send size={16} />
                                Save Correction for Training
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Select a conversation to review
                    </div>
                )}
            </div>
        </div>
    );
}
