export interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
}

export interface Exam {
    id: string;
    title: string;
    passingScore: number; // Percentage
    questions: Question[];
}

// Mock Database of Exams
export const MOCK_EXAMS: Record<string, Exam> = {
    'business-online-101': {
        id: 'business-online-101',
        title: 'Business Online 101 Certification',
        passingScore: 70,
        questions: [
            {
                id: 'q1',
                text: 'Apa langkah pertama dalam memulai bisnis online?',
                options: [
                    'Membuat logo',
                    'Riset pasar & produk',
                    'Mencari investor',
                    'Menyewa kantor'
                ],
                correctIndex: 1
            },
            {
                id: 'q2',
                text: 'Platform mana yang paling efektif untuk B2B marketing?',
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
                    'Sales Executive Officer',
                    'System Error Output',
                    'Social Engagement Organization'
                ],
                correctIndex: 0
            },
            {
                id: 'q4',
                text: 'Mengapa retensi pelanggan penting?',
                options: [
                    'Karena pelanggan baru lebih murah',
                    'Karena meningkatkan Customer Lifetime Value (CLV)',
                    'Tidak terlalu penting',
                    'Hanya untuk pamer data'
                ],
                correctIndex: 1
            },
            {
                id: 'q5',
                text: 'Metrics apa yang digunakan untuk mengukur biaya akuisisi pelanggan?',
                options: [
                    'ROI',
                    'CAC (Customer Acquisition Cost)',
                    'NPS',
                    'Churn Rate'
                ],
                correctIndex: 1
            }
        ]
    }
};

export async function getExam(slug: string): Promise<Exam | null> {
    // In real app, fetch from DB
    return MOCK_EXAMS[slug] || null;
}
