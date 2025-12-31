import { createClient } from '@/utils/supabase/server';
import { createHash } from 'crypto';

export interface ConsentData {
    userId: string;
    documentType: 'TOS' | 'PRIVACY' | 'REFUND';
    documentVersion: string;
    documentContent: string; // We'll hash this
    ipAddress: string;
    userAgent: string;
}

export async function recordConsent(data: ConsentData) {
    const supabase = await createClient();

    // Calculate Hash
    const hash = createHash('sha256').update(data.documentContent).digest('hex');

    const { error } = await (supabase as any)
        .from('legal_consents')
        .insert({
            user_id: data.userId,
            document_type: data.documentType,
            document_version: data.documentVersion,
            document_hash: hash,
            ip_address: data.ipAddress,
            user_agent: data.userAgent
        });

    if (error) {
        console.error('Failed to record consent:', error);
        throw new Error('Consent recording failed');
    }

    return true;
}

export async function hasUserConsented(userId: string, docType: string, version: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
        .from('legal_consents')
        .select('id')
        .eq('user_id', userId)
        .eq('document_type', docType)
        .eq('document_version', version)
        .limit(1);

    if (error) return false;
    return (data && data.length > 0);
}
