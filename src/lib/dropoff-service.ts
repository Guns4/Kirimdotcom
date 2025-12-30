'use server';

import { createClient } from '@/utils/supabase/server';
import { getAgentStatus } from './agent-service';

export async function scanDropoff(receiptNumber: string) {
    const supabase = await createClient();
    const agent = await getAgentStatus();

    if (!agent || agent.status !== 'APPROVED') {
        throw new Error('Agent acount not active');
    }

    // Check if already exists
    const { data: existing } = await supabase
        .from('agent_dropoffs')
        .select('id')
        .eq('receipt_number', receiptNumber)
        .single();

    if (existing) {
        throw new Error('Package already scanned');
    }

    const { error } = await supabase.from('agent_dropoffs').insert({
        agent_id: agent.id,
        receipt_number: receiptNumber,
        status: 'AT_AGENT'
    });

    if (error) throw error;
    return { success: true };
}

export async function getAgentInventory() {
    const supabase = await createClient();
    const agent = await getAgentStatus();
    if (!agent) return [];

    const { data } = await supabase
        .from('agent_dropoffs')
        .select('*')
        .eq('agent_id', agent.id)
        .eq('status', 'AT_AGENT')
        .order('created_at', { ascending: false });

    return data || [];
}

export async function submitHandover(packageIds: string[], courierName: string, signatureData: string) {
    const supabase = await createClient();

    // In real app, upload signatureData (base64) to Storage and get URL
    // Here we mock it
    const mockSignatureUrl = `https://storage.cekkirim.com/signatures/${Date.now()}.png`;

    const { error } = await supabase
        .from('agent_dropoffs')
        .update({
            status: 'PICKED_UP',
            courier_name: courierName,
            courier_signature_url: mockSignatureUrl,
            handover_at: new Date().toISOString()
        })
        .in('id', packageIds);

    if (error) throw error;
    return { success: true };
}
