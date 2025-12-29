import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export default function FAQPage() {
    const faqs = [
        {
            category: "Tracking & Cek Resi",
            items: [
                {
                    q: "Bagaimana cara melacak paket saya?",
                    a: "Cukup masukkan nomor resi di kolom tracking di halaman utama, lalu klik 'Lacak Paket'. Sistem kami akan otomatis mendeteksi kurir dan menampilkan informasi terkini."
                },
                {
                    q: "Kenapa nomor resi saya tidak ditemukan?",
                    a: "Ada beberapa kemungkinan: (1) Nomor resi belum terupdate di system kurir, tunggu 1-2 jam setelah pickup, (2) Format nomor resi salah, pastikan tidak ada spasi atau karakter khusus, (3) Pilih kurir yang tepat."
                },
                {
                    q: "Apakah bisa tracking banyak resi sekaligus?",
                    a: "Ya! Gunakan fitur 'Bulk Tracking' di menu Tools. Anda bisa tracking hingga 50 resi sekaligus dan export hasilnya ke Excel."
                }
            ]
        },
        {
            category: "Cek Ongkir",
            items: [
                {
                    q: "Apakah harga ongkir yang ditampilkan sudah final?",
                    a: "Harga yang ditampilkan adalah estimasi berdasarkan tarif resmi kurir. Untuk harga pasti, silakan cek langsung dengan kurir atau marketplace tempat Anda berjualan."
                },
                {
                    q: "Kenapa harga ongkir beda dengan marketplace?",
                    a: "Marketplace biasanya dapat harga khusus/subsidi dari kurir. Harga di CekKirim adalah tarif reguler untuk pengiriman langsung."
                },
                {
                    q: "Bisa cek ongkir ke luar negeri?",
                    a: "Saat ini CekKirim fokus untuk pengiriman domestik Indonesia. Untuk pengiriman internasional, silakan hubungi kurir langsung."
                }
            ]
        },
        {
            category: "Tools & Fitur",
            items: [
                {
                    q: "Apakah semua fitur gratis?",
                    a: "Ya, semua fitur dasar CekKirim 100% GRATIS. Untuk fitur developer (API), tersedia paket berbayar dengan harga terjangkau."
                },
                {
                    q: "Bagaimana cara pakai Bot Caption Jualan?",
                    a: "Kunjungi Tools > Bot Caption Jualan, masukkan nama produk dan deskripsi singkat, lalu AI kami akan generate caption menarik untuk jualan Anda."
                },
                {
                    q: "Apakah data saya aman?",
                    a: "Sangat aman! Kami tidak menyimpan data pribadi atau nomor resi Anda. Semua tracking dilakukan real-time dari server kurir."
                }
            ]
        },
        {
            category: "Akun & Membership",
            items: [
                {
                    q: "Harus daftar untuk pakai CekKirim?",
                    a: "Tidak wajib! Anda bisa langsung pakai fitur tracking dan cek ongkir tanpa daftar. Daftar hanya diperlukan untuk fitur lanjutan seperti API, riwayat tracking, dll."
                },
                {
                    q: "Apakah ada versi aplikasi mobile?",
                    a: "Website CekKirim sudah mobile-friendly dan bisa di-install sebagai PWA (Progressive Web App) di smartphone Anda. Tekan 'Add to Home Screen' di browser."
                }
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-xl opacity-90">
                            Temukan jawaban atas pertanyaan yang sering diajukan seputar CekKirim
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16">
                <div className="container-custom max-w-4xl">
                    <div className="space-y-12">
                        {faqs.map((category, catIndex) => (
                            <div key={catIndex}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-indigo-200">
                                    {category.category}
                                </h2>
                                <div className="space-y-4">
                                    {category.items.map((faq, faqIndex) => (
                                        <details
                                            key={faqIndex}
                                            className="group bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-all overflow-hidden"
                                        >
                                            <summary className="flex items-center justify-between cursor-pointer p-6 text-left font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                                                {faq.q}
                                                <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                                            </summary>
                                            <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                                {faq.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Masih ada pertanyaan?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Tim kami siap membantu Anda
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                        >
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
