'use client';

import React, { useState } from 'react';
import { useContactSync, EnrichedContact } from '@/hooks/useContactSync';
import { User, Search, RefreshCw, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

interface ContactPickerProps {
    onSelect: (contact: EnrichedContact) => void;
}

export function ContactPicker({ onSelect }: ContactPickerProps) {
    const { contacts, loading, syncContacts } = useContactSync();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Verify native platform silently
    const isNative = Capacitor.isNativePlatform();
    if (!isNative) return null; // Don't show on web

    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phoneNumber.includes(search)
    );

    return (
        <div className="mt-2">
            {/* Trigger Button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => { setIsOpen(true); syncContacts(); }}
                    className="text-xs flex items-center gap-1 text-indigo-600 font-medium hover:underline"
                >
                    <User className="w-3 h-3" /> Ambil dari Kontak
                </button>
            )}

            {/* Picker Modal / Dropdown */}
            {isOpen && (
                <div className="relative mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col z-50">
                    <div className="p-2 border-b border-gray-100 flex gap-2 items-center bg-gray-50">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            className="flex-1 bg-transparent text-sm focus:outline-none"
                            placeholder="Cari nama atau nomor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1 p-1">
                        {loading && (
                            <div className="flex items-center justify-center py-4 text-xs text-gray-400 gap-2">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Load Kontak...
                            </div>
                        )}

                        {!loading && filtered.length === 0 && (
                            <div className="py-4 text-center text-xs text-gray-400">Kontak tidak ditemukan.</div>
                        )}

                        {filtered.map((contact, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    onSelect(contact);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left p-2 hover:bg-indigo-50 rounded-lg flex items-center gap-3 transition-colors"
                            >
                                {/* Avatar / Initial */}
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 relative">
                                    {contact.avatarUrl ? (
                                        <img src={contact.avatarUrl} alt={contact.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        contact.name.charAt(0)
                                    )}

                                    {/* CekKirim Badge */}
                                    {contact.isAppUser && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm" title="Pengguna CekKirim">
                                            <img src="/logo.png" className="w-3 h-3" alt="CK" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            <span className="text-[6px] text-blue-600 font-black">CK</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-1">
                                        {contact.name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">{contact.phoneNumber}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
