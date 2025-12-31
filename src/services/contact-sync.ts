import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';

export interface SyncedContact {
    name: string;
    phones: string[];
    isAppUser?: boolean; // True if matches CekKirim DB
    avatarUrl?: string;
    contactId?: string;
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
                contactId: c.contactId,
                name: c.name?.display || 'Unknown',
                phones: c.phones?.map(p => p.number) || [],
                isAppUser: false, // Default, will update after API check
            }));

            return contacts;
        } catch (error) {
            console.error('Failed to sync contacts:', error);
            return MOCK_CONTACTS; // Fail soft
        }
    }
};

const MOCK_CONTACTS: SyncedContact[] = [
    { name: 'Budi Santoso', phones: ['08123456789'], isAppUser: true },
    { name: 'Siti Aminah', phones: ['08567891234'], isAppUser: false },
    { name: 'Agus Ekspedisi', phones: ['08199988877'], isAppUser: true },
];
