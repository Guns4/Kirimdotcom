export interface Lesson {
    id: string;
    title: string;
    duration: string;
    videoUrl: string; // YouTube ID or URL
    isCompleted?: boolean;
}

export interface Course {
    id: string;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    lessons: Lesson[];
    totalDuration: string;
    studentCount: number;
}

// MOCK DATA for "Utility" / "MVP" Phase
export const MOCK_COURSES: Course[] = [
    {
        id: 'c1',
        slug: 'business-online-101',
        title: 'Bisnis Online 101: Dari Nol sampai Omzet',
        description: 'Panduan lengkap memulai bisnis dropship dan reseller tanpa modal besar.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        price: 150000,
        studentCount: 1240,
        totalDuration: '2 Jam',
        lessons: [
            { id: 'l1', title: 'Mindset Pengusaha Sukses', duration: '15:00', videoUrl: 'dQw4w9WgXcQ', isCompleted: true },
            { id: 'l2', title: 'Riset Produk Laris', duration: '20:00', videoUrl: 'dQw4w9WgXcQ', isCompleted: true },
            { id: 'l3', title: 'Cara Jualan di Marketplace', duration: '25:00', videoUrl: 'dQw4w9WgXcQ' },
        ]
    },
    {
        id: 'c2',
        slug: 'master-logistik',
        title: 'Master Logistik: Hemat Ongkir 50%',
        description: 'Strategi pengiriman efisien untuk scale-up bisnis UMKM Anda.',
        thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
        price: 99000,
        studentCount: 850,
        totalDuration: '1.5 Jam',
        lessons: [
            { id: 'l1', title: 'Memilih Ekspedisi Tepat', duration: '10:00', videoUrl: 'dQw4w9WgXcQ', isCompleted: false },
            { id: 'l2', title: 'Packing Aman & Murah', duration: '15:00', videoUrl: 'dQw4w9WgXcQ', isCompleted: false },
        ]
    }
];

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
    // Simulate DB Fetch
    return MOCK_COURSES.find(c => c.slug === slug);
}

export async function getAllCourses(): Promise<Course[]> {
    return MOCK_COURSES;
}
