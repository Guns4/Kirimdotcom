'use client';

import React, { useEffect } from 'react';
import { useContactSync } from '@/hooks/useContactSync';
import { User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactPickerProps {
    onSelect: (contact: { name: string; phone: string }) => void;
}

export function ContactPicker({ onSelect }: ContactPickerProps) {
    const { contacts, loading, sync } = useContactSync();

    useEffect(() => {
        sync();
    }, [sync]);

    if (loading) return <div className="p-4 text-center text-sm">Loading Contacts...</div>;

    return (
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Kontak Teman</h3>
            {contacts.map((contact, idx) => (
                <div key={idx}
                    onClick={() => onSelect({ name: contact.name, phone: contact.phones[0] })}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{contact.name}</p>
                            <p className="text-xs text-gray-400">{contact.phones[0]}</p>
                        </div>
                    </div>

                    {contact.isAppUser && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span>Pakai CekKirim</span>
                        </div>
                    )}
                </div>
            ))}
            <Button variant="ghost" size="sm" onClick={sync} className="w-full mt-2 text-xs">
                Refresh Contacts
            </Button>
        </div>
    );
}
