import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function logAdminAction(
    action: string,
    target: string,
    details: Record<string, any> = {}
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('Failed to log admin action: No authenticated user');
            return;
        }

        const headerList = headers();
        const ip = headerList.get('x-forwarded-for') || 'unknown';

        await supabase.from('admin_activity_logs').insert({
            admin_id: user.id,
            action,
            target,
            details,
            ip_address: ip
        });

    } catch (error) {
        // Fail silently to not block the main action, just log to console
        console.error('Admin Logger Error:', error);
    }
}
