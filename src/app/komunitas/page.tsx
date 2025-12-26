import { Metadata } from 'next'
import GiscusWidget from '@/components/community/GiscusWidget'
import { MessageCircle, Users, Coffee } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Lapak Curhat & Komunitas - CekKirim',
    description: 'Diskusi seputar pengalaman pengiriman paket, review ekspedisi (JNE, J&T, SiCepat), dan tips logistik.',
}

export default function CommunityPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16 px-4">
            <div className="container-custom max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600/20 rounded-full text-pink-400 text-sm mb-6">
                        <Users className="w-4 h-4" />
                        Komunitas CekKirim
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Lapak <span className="gradient-text">Curhat</span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Ceritakan pengalamanmu kirim paket, komplain keterlambatan, atau bagi tips seputar ekspedisi di sini.
                    </p>
                </div>

                <div className="glass-card p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
                        <MessageCircle className="w-6 h-6 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white">Diskusi Terbaru</h2>
                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl mb-8 text-sm text-yellow-200 flex gap-3">
                        <Coffee className="w-5 h-5 flex-shrink-0" />
                        <p>
                            Gunakan bahasa yang sopan. Ujaran kebencian atau spam akan dihapus. Komentar di bawah menggunakan akun GitHub untuk mencegah spam.
                        </p>
                    </div>

                    {/* Giscus Widget Configuration */}
                    {/* Note: User must replace repo/category IDs with their own to make this work */}
                    <div className="min-h-[400px]">
                        <GiscusWidget
                            repo="YOUR_GITHUB_USERNAME/YOUR_REPO_NAME" // GANTI DENGAN REPO ANDA
                            repoId="YOUR_REPO_ID" // GANTI DENGAN REPO ID
                            category="General" // GANTI DENGAN KATEGORI DISKUSI
                            categoryId="YOUR_CATEGORY_ID" // GANTI DENGAN CATEGORY ID
                            mapping="pathname"
                            theme="dark_dimmed"
                            lang="id"
                        />
                        <p className="text-center text-xs text-gray-600 mt-4">
                            *Jika kolom komentar tidak muncul, pastikan konfigurasi Repository ID di kodingan sudah benar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
