'use client';

import { use } from 'react';
import { Send, Lock, Phone } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface Props {
    params: Promise<{
        bookingId: string;
    }>;
}

export default function ChatRoomPage({ params }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bookingId } = use(params);
    const [messages, setMessages] = useState([
        { id: 1, text: 'Halo! Selamat datang di sesi konsultasi.', sender: 'system' }
    ]);
    const [input, setInput] = useState('');

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), text: input, sender: 'me' }]);
        setInput('');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                        <h1 className="font-bold text-gray-800 text-sm md:text-base">Sesi Konsultasi Privat</h1>
                        <p className="text-xs text-gray-500">End-to-End Encrypted</p>
                    </div>
                </div>
                <Link href="/consultation" className="text-red-500 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">
                    Akhiri Sesi
                </Link>
            </header>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-w-3xl mx-auto w-full">
                <div className="flex justify-center my-4">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Private Room Active
                    </span>
                </div>

                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                       max-w-[80%] rounded-2xl px-4 py-2 text-sm
                       ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'}
                       ${msg.sender === 'system' ? 'bg-gray-200 text-gray-600 text-xs text-center w-full max-w-none shadow-none bg-transparent' : ''}
                   `}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="bg-white border-t p-4 sticky bottom-0">
                <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-2">
                    <input
                        className="flex-1 bg-gray-100 border-0 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Ketik pesan..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
