export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctIndex: number; // 0-3
}

export interface Exam {
    courseSlug: string;
    title: string;
    questions: QuizQuestion[];
    passingScore: number;
}

export const MOCK_EXAMS: Record<string, Exam> = {
    'business-online-101': {
        courseSlug: 'business-online-101',
        title: 'Ujian Akhir: Bisnis Online 101',
        passingScore: 80,
        questions: [
            {
                id: 'q1',
                text: 'Apa langkah pertama yang paling krusial sebelum memulai bisnis dropship?',
                options: [
                    'Mencari Karyawan',
                    'Riset Produk & Kompetitor',
                    'Sewa Gudang',
                    'Pinjam Modal Bank'
                ],
                correctIndex: 1
            },
            {
                id: 'q2',
                text: 'Mana platform yang paling cocok untuk B2B Marketing?',
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
                text: 'Bagaimana cara menentukan HPP (Harga Pokok Penjualan) yang benar?',
                options: [
                    'Hanya menghitung biaya beli barang',
                    'Biaya beli + Operasional + Marketing',
                    'Mengikuti harga kompetitor',
                    'Dikira-kira saja'
                ],
                correctIndex: 1
            }
        ]
    },
    'master-logistik': {
        courseSlug: 'master-logistik',
        title: 'Ujian Sertifikasi Master Logistik',
        passingScore: 70,
        questions: [
            {
                id: 'q1',
                text: 'Apa arti istilah "Volumetric Weight" dalam pengiriman?',
                options: [
                    'Berat asli timbangan',
                    'Berat berdasarkan dimensi paket (P x L x T)',
                    'Berat kemasan',
                    'Berat bersih barang'
                ],
                correctIndex: 1
            }
        ]
    }
};
