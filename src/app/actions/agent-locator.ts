'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Agent {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    courier_services: string[];
    operating_hours: string;
    contact_number: string;
    is_verified: boolean;
}

export async function getAgents(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
): Promise<Agent[]> {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
        .from('logistics_agents')
        .select('*')
        .eq('is_verified', true)
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng)
        .limit(100);

    if (error) {
        console.error('Error fetching agents:', error);
        return [];
    }

    return data || [];
}

export async function submitAgent(formData: FormData) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'You must be logged in to submit an agent.' };
    }

    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const services = (formData.get('services') as string).split(',').map(s => s.trim());
    const hours = formData.get('hours') as string;
    const phone = formData.get('phone') as string;

    const { error } = await (supabase as any)
        .from('logistics_agents')
        .insert({
            name,
            address,
            latitude,
            longitude,
            courier_services: services,
            operating_hours: hours,
            contact_number: phone,
            submitted_by: user.id,
            is_verified: false // Requires admin approval
        });

    if (error) {
        return { success: false, message: error.message };
    }

    revalidatePath('/area');
    return { success: true, message: 'Agent submitted successfully! Waiting for verification.' };
}
