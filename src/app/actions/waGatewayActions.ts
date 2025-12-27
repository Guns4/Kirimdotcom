'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Fonnte API config
const FONNTE_API_URL = 'https://api.fonnte.com/send';

interface SendWAResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send WhatsApp message via Fonnte
 */
async function sendViaFonnte(
    apiKey: string,
    phone: string,
    message: string
): Promise<SendWAResult> {
    try {
        const response = await fetch(FONNTE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target: phone,
                message: message,
                countryCode: '62', // Indonesia
            }),
        });

        const data = await response.json();

        if (data.status) {
            return {
                success: true,
                messageId: data.id,
            };
        } else {
            return {
                success: false,
                error: data.reason || 'Failed to send message',
            };
        }
    } catch (error) {
        console.error('Fonnte API error:', error);
        return {
            success: false,
            error: 'API connection failed',
        };
    }
}

/**
 * Get user's WA settings
 */
export async function getWASettings() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('wa_user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        return { data, error };
    } catch (error) {
        console.error('Error fetching WA settings:', error);
        return { data: null, error: 'Failed to fetch settings' };
    }
}

/**
 * Save WA settings
 */
export async function saveWASettings(settings: {
    wa_api_key: string;
    wa_provider: string;
    wa_sender_number?: string;
    notify_on_delivered?: boolean;
    notify_on_retur?: boolean;
    notify_on_pickup?: boolean;
}) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('wa_user_settings')
            .upsert({
                user_id: user.id,
                ...settings,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Error saving WA settings:', error);
            return { success: false, error: 'Failed to save settings' };
        }

        // Create default templates if not exist
        await supabase.rpc('create_default_wa_templates', {
            p_user_id: user.id,
        });

        revalidatePath('/dashboard/notifications');

        return { success: true, message: 'Settings saved successfully!' };
    } catch (error) {
        console.error('Error in saveWASettings:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get user's WA templates
 */
export async function getWATemplates() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('wa_templates')
            .select('*')
            .eq('user_id', user.id)
            .order('trigger_event');

        return { data, error };
    } catch (error) {
        console.error('Error fetching templates:', error);
        return { data: null, error: 'Failed to fetch templates' };
    }
}

/**
 * Update WA template
 */
export async function updateWATemplate(
    templateId: string,
    messageTemplate: string
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const { error } = await supabase
            .from('wa_templates')
            .update({
                message_template: messageTemplate,
                updated_at: new Date().toISOString(),
            })
            .eq('id', templateId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error updating template:', error);
            return { success: false, error: 'Failed to update template' };
        }

        return { success: true, message: 'Template updated!' };
    } catch (error) {
        console.error('Error in updateWATemplate:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Send WA notification (triggered by tracking status change)
 */
export async function sendWANotification(
    userId: string,
    recipientPhone: string,
    triggerEvent: 'delivered' | 'retur' | 'pickup' | 'transit',
    awb: string,
    variables: {
        customer_name?: string;
        shop_name?: string;
        estimated_days?: string;
    }
) {
    try {
        const supabase = await createClient();

        // Queue notification in database
        const { data: logId, error: queueError } = await supabase.rpc(
            'queue_wa_notification',
            {
                p_user_id: userId,
                p_recipient_phone: recipientPhone,
                p_recipient_type: triggerEvent === 'retur' ? 'seller' : 'buyer',
                p_trigger_event: triggerEvent,
                p_awb: awb,
                p_variables: variables,
            }
        );

        if (queueError || !logId) {
            return { success: false, error: 'Failed to queue notification' };
        }

        // Get settings to send
        const { data: settings } = await supabase
            .from('wa_user_settings')
            .select('wa_api_key, wa_provider')
            .eq('user_id', userId)
            .single();

        if (!settings?.wa_api_key) {
            return { success: false, error: 'WA API key not configured' };
        }

        // Get the queued message
        const { data: log } = await supabase
            .from('wa_notification_log')
            .select('message_sent')
            .eq('id', logId)
            .single();

        if (!log) {
            return { success: false, error: 'Message not found' };
        }

        // Send via Fonnte
        const result = await sendViaFonnte(
            settings.wa_api_key,
            recipientPhone,
            log.message_sent
        );

        // Update log with result
        await supabase
            .from('wa_notification_log')
            .update({
                status: result.success ? 'sent' : 'failed',
                message_id: result.messageId,
                error_message: result.error,
            })
            .eq('id', logId);

        return result;
    } catch (error) {
        console.error('Error sending WA notification:', error);
        return { success: false, error: 'System error' };
    }
}

/**
 * Get notification history
 */
export async function getNotificationHistory(limit: number = 50) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: 'Not authenticated' };
        }

        const { data, error } = await supabase
            .from('wa_notification_log')
            .select('*')
            .eq('user_id', user.id)
            .order('sent_at', { ascending: false })
            .limit(limit);

        return { data, error };
    } catch (error) {
        console.error('Error fetching history:', error);
        return { data: null, error: 'Failed to fetch history' };
    }
}

/**
 * Test WA connection
 */
export async function testWAConnection(apiKey: string, testPhone: string) {
    const result = await sendViaFonnte(
        apiKey,
        testPhone,
        '🔔 Test notifikasi dari CekKirim!\n\nKoneksi WhatsApp berhasil! ✅'
    );

    return result;
}
