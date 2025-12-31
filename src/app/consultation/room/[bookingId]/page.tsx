import React from 'react';

export default function RoomPage({ params }: { params: { bookingId: string } }) {
    // This would be a real-time chat/video room using Supabase Realtime or WebRTC
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-zinc-50 dark:bg-black">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center">
                <div>
                    <h2 className="font-bold">Consultation Session</h2>
                    <p className="text-xs text-zinc-500">ID: {params.bookingId}</p>
                </div>
                <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                    End Session
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center text-zinc-400">
                <div className="text-center">
                    <p className="text-2xl mb-2">💬</p>
                    <p>Secure Consultation Room</p>
                    <p className="text-sm">Video & Chat features initialized...</p>
                </div>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 p-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent"
                    />
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Send</button>
                </div>
            </div>
        </div>
    );
}
