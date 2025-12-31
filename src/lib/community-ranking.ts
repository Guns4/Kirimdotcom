export interface AgentRanking {
    id: string;
    name: string;
    avatar: string;
    points: number;
    badges: string[];
    area: string; // e.g., "Jakarta Selatan", "Bandung"
}

export const MOCK_RANKINGS: AgentRanking[] = [
    {
        id: 'a1',
        name: 'Top Kurir JKT',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kurir1',
        points: 1250,
        badges: ['🚀 Fast', '⭐ Top Rated'],
        area: 'Jakarta Selatan'
    },
    {
        id: 'a2',
        name: 'Agen Logistik BDG',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agen2',
        points: 980,
        badges: ['📦 High Volume'],
        area: 'Bandung'
    },
    {
        id: 'a3',
        name: 'Sby Express',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sby3',
        points: 850,
        badges: ['🛡️ Safe Handler'],
        area: 'Surabaya'
    },
    {
        id: 'a4',
        name: 'Medan Fast',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Medan4',
        points: 720,
        badges: ['⚡ Quick Pickup'],
        area: 'Medan'
    },
    {
        id: 'a5',
        name: 'Bali Cargo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bali5',
        points: 600,
        badges: [],
        area: 'Denpasar'
    }
];

export function getLeaderboardByArea(areaSlug: string): AgentRanking[] {
    // Simple mock logic: return all mixed, realistically filter by area
    // For demo, we just shuffle or return top 3
    return MOCK_RANKINGS.sort((a, b) => b.points - a.points);
}
