export interface Mentor {
    id: string;
    name: string;
    expertise: string[];
    rate: number; // per hour
    rating: number;
    avatar: string;
    bio: string;
}

export const MOCK_MENTORS: Mentor[] = [
    {
        id: 'm1',
        name: 'Budi Santoso',
        expertise: ['Logistics Strategy', 'Supply Chain', 'Import/Export'],
        rate: 500000,
        rating: 4.8,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
        bio: 'Expert in logistics with 15 years experience managing heavy cargo fleets.'
    },
    {
        id: 'm2',
        name: 'Siti Aminah',
        expertise: ['Digital Marketing', 'E-commerce Growth', 'Branding'],
        rate: 350000,
        rating: 4.9,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
        bio: 'Helping detailed oriented businesses grow their online presence.'
    },
    {
        id: 'm3',
        name: 'Andi Pratama',
        expertise: ['Warehouse Management', 'Inventory Control'],
        rate: 400000,
        rating: 4.7,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi',
        bio: 'Warehouse optimization specialist reducing sortation times by 40%.'
    }
];

export async function getMentorById(id: string): Promise<Mentor | undefined> {
    return MOCK_MENTORS.find(m => m.id === id);
}
