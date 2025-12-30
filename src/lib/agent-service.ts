'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export interface AgentPayload {
    shop_name: string;
    shop_address: string;
    phone_number: string;
    latitude: number;
    longitude: number;
    ktp_url: string;
    shop_photo_url: string;
}

export async function submitAgentRegistration(data: AgentPayload) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Save Data
    const { data: agent, error } = await supabase.from('agents').insert({
        user_id: user.id,
        ...data,
        is_paid: false, // User needs to pay next
        status: 'PENDING'
    }).select().single();

    if (error) {
        console.error('Registration Error:', error);
        throw new Error('Failed to submit application');
    }

    // 2. Mock Payment Process (Immediate Success for MVP)
    // In real world: Redirect to Midtrans/Xendit invoice
    await supabase.from('agents').update({ is_paid: true }).eq('id', agent.id);

    return { success: true, agentId: agent.id };
}

export async function getAgentStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase.from('agents').select('*').eq('user_id', user.id).single();
    return data;
}
