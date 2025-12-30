// Bio Link Service
// Linktree-style page with integrated tracking

export interface BioPage {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    backgroundColor: string;
    accentColor: string;
    whatsappNumber?: string;
    instagramHandle?: string;
    tiktokHandle?: string;
    showResiTracker: boolean;
    showProducts: boolean;
    allowedCouriers: string[];
    totalViews: number;
    totalClicks: number;
    isActive: boolean;
}

export interface BioLink {
    id: string;
    bioPageId: string;
    title: string;
    url: string;
    icon?: string;
    sortOrder: number;
    clicks: number;
    isActive: boolean;
}

export interface BioAnalytics {
    totalViews: number;
    totalClicks: number;
    viewsByDay: { date: string; count: number }[];
    topLinks: { title: string; clicks: number }[];
    sources: { source: string; count: number }[];
}

// Courier options for resi tracker filter
export const COURIER_OPTIONS = [
    { id: 'jne', name: 'JNE', icon: '📦' },
    { id: 'jnt', name: 'J&T Express', icon: '🚚' },
    { id: 'sicepat', name: 'SiCepat', icon: '⚡' },
    { id: 'anteraja', name: 'AnterAja', icon: '🛵' },
    { id: 'ninja', name: 'Ninja Van', icon: '🥷' },
    { id: 'pos', name: 'POS Indonesia', icon: '📮' },
    { id: 'wahana', name: 'Wahana', icon: '📍' },
    { id: 'lion', name: 'Lion Parcel', icon: '🦁' },
];

// Get bio page by username
export async function getBioByUsername(username: string): Promise<BioPage | null> {
    // In production: Query from Supabase
    // const { data } = await supabase.from('bio_pages').select('*').eq('username', username);

    // Mock data
    return {
        id: '1',
        userId: 'user1',
        username,
        displayName: 'Toko Sample',
        bio: '🛍️ Trusted Seller | Fast Response | COD Available',
        avatarUrl: '/avatar-sample.jpg',
        backgroundColor: '#1F2937',
        accentColor: '#3B82F6',
        whatsappNumber: '6281234567890',
        instagramHandle: '@tokosample',
        tiktokHandle: '@tokosample',
        showResiTracker: true,
        showProducts: true,
        allowedCouriers: ['jne', 'jnt', 'sicepat'],
        totalViews: 1250,
        totalClicks: 340,
        isActive: true
    };
}

// Get links for a bio page
export async function getBioLinks(bioPageId: string): Promise<BioLink[]> {
    // In production: Query from Supabase
    return [
        { id: '1', bioPageId, title: '🛒 Shopee', url: 'https://shopee.co.id/tokosample', sortOrder: 0, clicks: 120, isActive: true },
        { id: '2', bioPageId, title: '🛍️ Tokopedia', url: 'https://tokopedia.com/tokosample', sortOrder: 1, clicks: 95, isActive: true },
        { id: '3', bioPageId, title: '📸 Instagram', url: 'https://instagram.com/tokosample', sortOrder: 2, clicks: 75, isActive: true },
        { id: '4', bioPageId, title: '🎵 TikTok Shop', url: 'https://tiktok.com/@tokosample', sortOrder: 3, clicks: 50, isActive: true },
    ];
}

// Track page view
export async function trackPageView(bioPageId: string, visitorInfo?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
}): Promise<void> {
    // In production: Insert to bio_analytics
    // await supabase.from('bio_analytics').insert({
    //     bio_page_id: bioPageId,
    //     event_type: 'VIEW',
    //     visitor_ip: visitorInfo?.ip,
    //     user_agent: visitorInfo?.userAgent,
    //     referrer: visitorInfo?.referrer
    // });

    // Update total views
    // await supabase.from('bio_pages').update({ total_views: sql`total_views + 1` }).eq('id', bioPageId);

    console.log('Page view tracked:', bioPageId);
}

// Track link click
export async function trackLinkClick(bioPageId: string, linkId: string): Promise<void> {
    // In production: Update analytics
    // await supabase.from('bio_analytics').insert({
    //     bio_page_id: bioPageId,
    //     event_type: 'LINK_CLICK',
    //     link_id: linkId
    // });
    // await supabase.from('bio_links').update({ clicks: sql`clicks + 1` }).eq('id', linkId);

    console.log('Link click tracked:', linkId);
}

// Track resi check
export async function trackResiCheck(bioPageId: string): Promise<void> {
    // In production: Insert to bio_analytics
    console.log('Resi check tracked:', bioPageId);
}

// Get analytics summary
export async function getAnalytics(bioPageId: string): Promise<BioAnalytics> {
    // In production: Query from Supabase with aggregations
    return {
        totalViews: 1250,
        totalClicks: 340,
        viewsByDay: [
            { date: '2024-12-25', count: 150 },
            { date: '2024-12-26', count: 180 },
            { date: '2024-12-27', count: 200 },
            { date: '2024-12-28', count: 220 },
            { date: '2024-12-29', count: 190 },
            { date: '2024-12-30', count: 160 },
            { date: '2024-12-31', count: 150 },
        ],
        topLinks: [
            { title: 'Shopee', clicks: 120 },
            { title: 'Tokopedia', clicks: 95 },
            { title: 'Instagram', clicks: 75 },
            { title: 'TikTok Shop', clicks: 50 },
        ],
        sources: [
            { source: 'Instagram', count: 450 },
            { source: 'TikTok', count: 380 },
            { source: 'Direct', count: 250 },
            { source: 'WhatsApp', count: 170 },
        ]
    };
}

// Generate share URL
export function getBioUrl(username: string): string {
    return `https://cekkkirim.com/bio/${username}`;
}
