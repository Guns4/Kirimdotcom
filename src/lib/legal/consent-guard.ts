import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

const CURRENT_TOS_VERSION = 'v2.0';
const CURRENT_PRIVACY_VERSION = 'v1.1';

export async function checkConsentCompliance(
    userId: string,
    request: Request
): Promise<{ compliant: boolean; requiresConsent?: string[] }> {
    const supabase = await createClient();

    // Get user's consent history
    const { data: consents } = await (supabase as any)
        .from('user_consents')
        .select('document_type, document_version')
        .eq('user_id', userId)
        .order('agreed_at', { ascending: false });

    const latestConsents: Record<string, string> = {};
    consents?.forEach((consent: any) => {
        if (!latestConsents[consent.document_type]) {
            latestConsents[consent.document_type] = consent.document_version;
        }
    });

    const missingConsents: string[] = [];

    // Check TOS
    if (latestConsents['TOS'] !== CURRENT_TOS_VERSION) {
        missingConsents.push('Terms of Service');
    }

    // Check Privacy Policy
    if (latestConsents['PRIVACY_POLICY'] !== CURRENT_PRIVACY_VERSION) {
        missingConsents.push('Privacy Policy');
    }

    if (missingConsents.length > 0) {
        return { compliant: false, requiresConsent: missingConsents };
    }

    return { compliant: true };
}

export async function recordConsent(
    userId: string,
    documentType: 'TOS' | 'PRIVACY_POLICY' | 'AUP',
    documentVersion: string,
    documentContent: string,
    request: Request
) {
    const supabase = await createClient();

    // Extract IP and User Agent
    const ip = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Hash document content for non-repudiation
    const consentHash = crypto
        .createHash('sha256')
        .update(documentContent)
        .digest('hex');

    await (supabase as any).from('user_consents').insert({
        user_id: userId,
        document_type: documentType,
        document_version: documentVersion,
        ip_address: ip,
        user_agent: userAgent,
        consent_hash: consentHash
    });

    console.log(`✅ Consent recorded: ${documentType} ${documentVersion} for user ${userId} from IP ${ip}`);
}
