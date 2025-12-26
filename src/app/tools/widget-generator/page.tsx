import { WidgetGenerator } from '@/components/tools/WidgetGenerator'
import { Metadata } from 'next'
import { Share2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Widget Generator - CekKirim',
    description: 'Pasang widget cek resi CekKirim di website atau blog Anda secara gratis.',
    keywords: ['widget cek resi', 'plugin cek resi', 'embed cek resi', 'gratis'],
}

export default function WidgetGeneratorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16 px-4">
            <div className="container-custom">
                <div className="max-w-3xl mx-auto mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full text-indigo-400 text-sm mb-6">
                        <Share2 className="w-4 h-4" />
                        Untuk Developer & Blogger
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Pasang Widget <span className="gradient-text">Cek Resi</span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Mudahkan pengunjung website Anda melacak paket tanpa harus berpindah halaman. Gratis, ringan, dan mudah dipasang.
                    </p>
                </div>

                <WidgetGenerator />
            </div>
        </div>
    )
}
