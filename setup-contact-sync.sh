#!/bin/bash

# setup-contact-sync.sh
# Social Growth (Phase 1931-1940)
# features: Contact Sync, "Send to Friend", PPOB Contact Badge

echo ">>> Setting up Contact Sync Infrastructure..."

# 1. Install Plugin
npm install @capacitor-community/contacts

# 2. Update Android Manifest (Documentation Only)
# echo "Add <uses-permission android:name="android.permission.READ_CONTACTS" /> to AndroidManifest.xml"

# 3. Create Contact Sync Service
mkdir -p src/services
cat > src/services/contact-sync.ts <<EOF
import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';

export interface SyncedContact {
  name: string;
  phones: string[];
  isAppUser?: boolean; // True if matches CekKirim DB
  avatarUrl?: string;
}

export const ContactSyncService = {
  /**
   * Request Permission and Fetch Contacts
   */
  async getContacts(): Promise<SyncedContact[]> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Contact Sync only works on Native Devices. Returning Mock Data.');
      return MOCK_CONTACTS;
    }

    try {
      const permission = await Contacts.requestPermissions();
      if (permission.contacts !== 'granted') {
        throw new Error('Permission denied');
      }

      const projection = {
        name: true,
        phones: true,
      };

      const result = await Contacts.getContacts({
        projection,
      });

      const contacts = result.contacts.map(c => ({
        name: c.name?.display || 'Unknown',
        phones: c.phones?.map(p => p.number) || [],
        isAppUser: false, // Default, will update after API check
      }));

      // In production: Send phones to API to check which ones are registered users
      // const appUsers = await api.checkRegisteredUsers(contacts.flatMap(c => c.phones));
      // return mergeContacts(contacts, appUsers);
      
      return contacts;
    } catch (error) {
      console.error('Failed to sync contacts:', error);
      return [];
    }
  }
};

const MOCK_CONTACTS: SyncedContact[] = [
  { name: 'Budi Santoso', phones: ['08123456789'], isAppUser: true },
  { name: 'Siti Aminah', phones: ['08567891234'], isAppUser: false },
  { name: 'Agus Ekspedisi', phones: ['08199988877'], isAppUser: true },
];
EOF

# 4. Create Hook
mkdir -p src/hooks
cat > src/hooks/useContactSync.ts <<EOF
'use client';

import { useState, useCallback } from 'react';
import { ContactSyncService, SyncedContact } from '@/services/contact-sync';

export function useContactSync() {
  const [contacts, setContacts] = useState<SyncedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ContactSyncService.getContacts();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { contacts, loading, error, sync };
}
EOF

# 5. Create UI Picker
mkdir -p src/components/grow
cat > src/components/grow/ContactPicker.tsx <<EOF
'use client';

import React, { useEffect } from 'react';
import { useContactSync } from '@/hooks/useContactSync';
import { User, Phone, CheckCircle } from 'lucide-react';
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
EOF

echo ">>> Contact Sync Setup Complete."
