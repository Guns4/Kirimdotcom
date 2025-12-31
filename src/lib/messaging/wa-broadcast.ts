import { createClient } from '@/utils/supabase/server';

interface BroadcastContact {
    name: string;
    phone_number: string;
}

export async function importContactsFromExcel(
    userId: string,
    contacts: BroadcastContact[]
): Promise<{ success: number; failed: number }> {
    const supabase = await createClient();
    let success = 0;
    let failed = 0;

    for (const contact of contacts) {
        const { error } = await (supabase as any)
            .from('broadcast_contacts')
            .insert({
                user_id: userId,
                name: contact.name,
                phone_number: normalizePhoneNumber(contact.phone_number)
            });

        if (error) {
            failed++;
        } else {
            success++;
        }
    }

    return { success, failed };
}

export async function createCampaign(
    userId: string,
    name: string,
    message: string,
    recipientIds: string[]
): Promise<{ campaignId: string | null; error?: string }> {
    const supabase = await createClient();

    // Check quota
    const { data: user } = await (supabase as any)
        .from('users')
        .select('broadcast_quota')
        .eq('id', userId)
        .single();

    if (!user || user.broadcast_quota < recipientIds.length) {
        return {
            campaignId: null,
            error: 'Insufficient broadcast quota. Please purchase more quota.'
        };
    }

    // Create campaign
    const { data: campaign, error } = await (supabase as any)
        .from('broadcast_campaigns')
        .insert({
            user_id: userId,
            name,
            message,
            total_recipients: recipientIds.length,
            status: 'QUEUED'
        })
        .select()
        .single();

    if (error) {
        return { campaignId: null, error: error.message };
    }

    // Queue messages with random delays (anti-ban)
    const baseTime = new Date();
    for (let i = 0; i < recipientIds.length; i++) {
        const contact = await getContact(recipientIds[i]);
        if (!contact) continue;

        // Random delay between 3-10 seconds
        const delaySeconds = 3 + Math.random() * 7;
        const sendAt = new Date(baseTime.getTime() + (i * delaySeconds * 1000));

        await (supabase as any).from('broadcast_queue').insert({
            campaign_id: campaign.id,
            contact_id: contact.id,
            phone_number: contact.phone_number,
            message,
            send_at: sendAt.toISOString()
        });
    }

    return { campaignId: campaign.id };
}

async function getContact(contactId: string) {
    const supabase = await createClient();
    const { data } = await (supabase as any)
        .from('broadcast_contacts')
        .select('*')
        .eq('id', contactId)
        .single();
    return data;
}

function normalizePhoneNumber(phone: string): string {
    // Remove all non-digits
    let normalized = phone.replace(/\D/g, '');

    // Add 62 prefix for Indonesian numbers if needed
    if (normalized.startsWith('0')) {
        normalized = '62' + normalized.substring(1);
    } else if (!normalized.startsWith('62')) {
        normalized = '62' + normalized;
    }

    return normalized;
}

// Worker function to process queue (run via cron)
export async function processMessageQueue() {
    const supabase = await createClient();

    const now = new Date().toISOString();

    // Get pending messages ready to send
    const { data: messages } = await (supabase as any)
        .from('broadcast_queue')
        .select('*')
        .eq('status', 'PENDING')
        .lte('send_at', now)
        .limit(10);

    for (const msg of messages || []) {
        try {
            // TODO: Integrate with WhatsApp API (e.g., Fonnte, WA Business API)
            // await sendWhatsAppMessage(msg.phone_number, msg.message);

            console.log(`Sending to ${msg.phone_number}: ${msg.message}`);

            // Update status
            await (supabase as any)
                .from('broadcast_queue')
                .update({ status: 'SENT', sent_at: new Date().toISOString() })
                .eq('id', msg.id);

            // Increment sent count
            await (supabase as any).rpc('increment_campaign_sent', {
                campaign_id: msg.campaign_id
            });

        } catch (error: any) {
            await (supabase as any)
                .from('broadcast_queue')
                .update({
                    status: 'FAILED',
                    error_message: error.message
                })
                .eq('id', msg.id);
        }
    }
}
