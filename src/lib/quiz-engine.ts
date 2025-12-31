export interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
}

export interface Exam {
    id: string;
    title: string;
    passingScore: number;
    questions: Question[];
}

export const MOCK_EXAM: Exam = {
    id: 'exam-101',
    title: 'Business Online 101 Certification',
    passingScore: 70,
    questions: [
        {
            id: 'q1',
            text: 'Apa strategi utama untuk meningkatkan retensi pelanggan?',
            options: [
                'Meningkatkan harga secara berkala',
                'Memberikan layanan pelanggan yang responsif',
                'Mengurangi kualitas produk',
                'Tidak menerima retur barang'
            ],
            correctIndex: 1
        },
        {
            id: 'q2',
            text: 'Platform mana yang paling efektif untuk B2B Marketing?',
            options: [
                'TikTok',
                'Instagram',
                'LinkedIn',
                'Snapchat'
            ],
            correctIndex: 2
        },
        {
            id: 'q3',
            text: 'Apa itu SEO?',
            options: [
                'Search Engine Optimization',
                'Sales Engine Online',
                'Social Engagement Organization',
                'System Electronic Order'
            ],
            correctIndex: 0
        },
        {
            id: 'q4',
            text: 'Metode pembayaran apa yang paling aman untuk transaksi internasional?',
            options: [
                'Transfer Bank Langsung',
                'Letter of Credit (L/C)',
                'Western Union',
                'Tunai'
            ],
            correctIndex: 1
        }
    ]
};

export async function getExamBySlug(slug: string): Promise<Exam | null> {
    // Mock logic
    if (slug === 'business-online-101') return MOCK_EXAM;
    return null;
}
