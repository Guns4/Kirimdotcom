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
