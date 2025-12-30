export interface Mentor {
    id: string;
    name: string;
    title: string;
    company: string;
    avatarUrl: string;
    hourlyRate: number;
    rating: number;
    topics: string[];
    isAvailable: boolean;
}

export const MOCK_MENTORS: Mentor[] = [
    {
        id: 'm1',
        name: 'Budi Santoso',
        title: 'Ex-VP Logistics',
        company: 'Logistik Indonesia',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        hourlyRate: 500000,
        rating: 4.9,
        topics: ['Supply Chain', 'Warehouse Management', 'Last Mile Delivery'],
        isAvailable: true
    },
    {
        id: 'm2',
        name: 'Siti Aminah',
        title: 'Digital Marketing Expert',
        company: 'Marketplace Pro',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        hourlyRate: 350000,
        rating: 4.8,
        topics: ['Ads Optimization', 'Branding', 'Copywriting'],
        isAvailable: true
    },
    {
        id: 'm3',
        name: 'Reza Rahardian',
        title: 'Import/Export Consultant',
        company: 'Global Trade',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        hourlyRate: 750000,
        rating: 5.0,
        topics: ['Customs', 'Freight Forwarding', 'Sourcing'],
        isAvailable: false
    }
];

export async function getAllMentors(): Promise<Mentor[]> {
    return MOCK_MENTORS;
}

export async function getMentorById(id: string): Promise<Mentor | undefined> {
    return MOCK_MENTORS.find(m => m.id === id);
}
