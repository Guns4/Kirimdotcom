import { createClient } from '@/utils/supabase/server';

export interface BioProfile {
    id: string;
    username: string;
    display_name: string;
    bio_text: string;
    avatar_url: string;
    theme_color: string;
    whatsapp_number: string;
    courier_filters: string[] | null;
    links: BioLink[];
    products: BioProduct[];
}

export interface BioLink {
    id: string;
    title: string;
    url: string;
    icon: string;
    sort_order: number;
}

export interface BioProduct {
    id: string;
    name: string;
    price: number;
    image_url: string;
    external_url: string;
}

export async function getBioProfile(username: string): Promise<BioProfile | null> {
    const supabase = await createClient();

    // Fetch Profile
    const { data: profile, error } = await (supabase as any)
        .from('bio_profiles')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

    if (error || !profile) return null;

    // Fetch Links
    const { data: links } = await (supabase as any)
        .from('bio_links')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    // Fetch Products
    const { data: products } = await (supabase as any)
        .from('bio_products')
        .select('*')
        .eq('profile_id', profile.id)
        .order('sort_order', { ascending: true });

    return {
        ...profile,
        links: links || [],
        products: products || []
    };
}

export async function trackBioEvent(profileId: string, eventType: string, metadata: any = {}) {
    const supabase = await createClient();

    // In a real implementation, we'd get IP/UA from headers here or let the client pass generic info if strictly client-side triggered
    // For server-side calls, headers are available. 
    // Since this might be called from a Client Component via Server Action, we'll keep it simple.

    await (supabase as any)
        .from('bio_analytics')
        .insert({
            profile_id: profileId,
            event_type: eventType,
            event_metadata: metadata
        });
}
