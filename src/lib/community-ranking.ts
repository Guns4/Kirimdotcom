export interface SellerProfile {
    id: string;
    name: string;
    avatar_url?: string;
    shipment_count: number;
    rating: number;
}

export async function getTopSellers(district: string): Promise<SellerProfile[]> {
    // In a real scenario, this would be:
    // const { data } = await supabase.from('sellers').select('*').eq('district', district).order('shipment_count', { ascending: false }).limit(5);

    // MOCK DATA for "Community Pride" feature
    // Generating deterministic mock data based on district name length so it feels consistent
    const seed = district.length;

    return [
        {
            id: 's1',
            name: `Toko Serba Ada ${district}`,
            shipment_count: 1250 + seed * 10,
            rating: 4.9
        },
        {
            id: 's2',
            name: `Fashion ${district} Collection`,
            shipment_count: 980 + seed * 5,
            rating: 4.8
        },
        {
            id: 's3',
            name: `${district} Gadget Store`,
            shipment_count: 850,
            rating: 4.7
        },
        {
            id: 's4',
            name: `Oleh-oleh Khas ${district}`,
            shipment_count: 620,
            rating: 4.9
        },
        {
            id: 's5',
            name: `Herbal Center ${district}`,
            shipment_count: 450,
            rating: 4.6
        }
    ];
}
