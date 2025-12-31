import { createClient } from '@/utils/supabase/client';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export async function checkDeviceTrust(userId: string): Promise<'TRUSTED' | 'NEW_DEVICE' | 'ERROR'> {
    try {
        // 1. Get Fingerprint
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const deviceHash = result.visitorId;

        const supabase = createClient();

        // 2. Check Database
        const { data } = await supabase
            .from('known_devices')
            .select('id, is_trusted')
            .eq('user_id', userId)
            .eq('device_hash', deviceHash)
            .single();

        if (data) {
            // Update Last Seen
            await supabase.from('known_devices').update({ last_seen: new Date() }).eq('id', data.id);
            return 'TRUSTED';
        } else {
            // New Device Detected!
            // In a real app, do NOT insert immediately. Trigger OTP flow first.
            // For this implementation, we flag it.

            console.warn('⚠️ New Device Detected:', deviceHash);
            return 'NEW_DEVICE';
        }
    } catch (e) {
        console.error('Fingerprint check failed', e);
        return 'ERROR';
    }
}

export async function registerDevice(userId: string, deviceHash: string, userAgent: string, ip: string) {
    const supabase = createClient();
    await supabase.from('known_devices').insert({
        user_id: userId,
        device_hash: deviceHash,
        user_agent: userAgent,
        ip_address: ip,
        is_trusted: true // Should be true ONLY after OTP
    });
}
