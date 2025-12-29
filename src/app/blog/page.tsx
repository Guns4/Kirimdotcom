import Link from 'next/link';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

export default function BlogPage() {
    const blogPosts = [
        {
            title: "Cara Melacak Paket dengan Mudah di 2024",
            slug: "cara-melacak-paket-2024",
            excerpt: "Panduan lengkap tracking paket dari berbagai kurir menggunakan CekKirim. Cepat, akurat, dan gratis!",
            category: "Tutorial",
            date: "30 Des 2024",
            image: "/placeholder-blog-1.jpg",
            readTime: "5 menit"
        },
        {
            title: "Tips Hemat Ongkir untuk Online Seller",
            slug: "tips-hemat-ongkir",
            excerpt: "Strategi jitu menghemat biaya pengiriman hingga 40% untuk bisnis online Anda.",
            category: "Tips Bisnis",
            date: "28 Des 2024",
            image: "/placeholder-blog-2.jpg",
            readTime: "7 menit"
        },
        {
            title: "Perbandingan Kurir Terbaik di Indonesia",
            slug: "perbandingan-kurir-indonesia",
            excerpt: "Analisis mendalam JNE, J&T, SiCepat, dan AnterAja. Mana yang paling cocok untuk bisnis Anda?",
            category: "Review",
            date: "25 Des 2024",
            image: "/placeholder-blog-3.jpg",
            readTime: "10 menit"
        },
        {
            title: "Arti Status 'On Process' dalam Tracking",
            slug: "arti-on-process",
            excerpt: "Pernah bingung dengan status tracking paket? Ini penjelasan lengkap setiap status pengiriman.",
            category: "Edukasi",
            date: "22 Des 2024",
            image: "/placeholder-blog-4.jpg",
            readTime: "6 menit"
        },
        {
            title: "Cara Menghindari COD Bermasalah",
            slug: "hindari-cod-bermasalah",
            excerpt: "Panduan praktis untuk seller agar terhindar dari pembeli COD nakal dan meminimalkan retur.",
            category: "Tips Bisnis",
            date: "20 Des 2024",
            image: "/placeholder-blog-5.jpg",
            readTime: "8 menit"
        },
        {
            title: "Update: Tarif Ongkir Terbaru 2024",
            slug: "tarif-ongkir-2024",
            excerpt: "Ringkasan perubahan tarif dari berbagai ekspedisi di awal tahun 2024.",
            category: "News",
            date: "18 Des 2024",
            image: "/placeholder-blog-6.jpg",
            readTime: "4 menit"
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Blog CekKirim
                        </h1>
                        <p className="text-xl opacity-90">
                            Tips, tutorial, dan insights seputar logistik & bisnis online Indonesia
                        </p>
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post, index) => (
                            <article
                                key={index}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                            >
                                {/* Image Placeholder */}
                                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <span className="text-sm">Featured Image</span>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-indigo-600">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {post.date}
                                        </span>
                                        <span>•</span>
                                        <span>{post.readTime} baca</span>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:gap-3 transition-all"
                                    >
                                        Baca Selengkapnya
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="text-center mt-12">
                        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl">
                            Muat Artikel Lainnya
                        </button>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="container-custom max-w-2xl text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        Dapatkan Update Terbaru
                    </h3>
                    <p className="text-gray-600 mb-8">
                        Subscribe newsletter kami untuk tips bisnis online dan update fitur CekKirim
                    </p>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Email Anda"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                        />
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
