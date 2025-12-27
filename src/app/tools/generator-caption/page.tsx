import { Metadata } from 'next'
import { CaptionGenerator } from '@/components/tools/CaptionGenerator'

export const metadata: Metadata = {
    title: 'Generator Caption Jualan (Mad Libs) - CekKirim',
    description: 'Bikin caption jualan yang menarik dalam hitungan detik. Tersedia template soft selling, hard selling, dan follow up customer. Copy & share ke WhatsApp dengan mudah.',
}

export default function CaptionGeneratorPage() {
    return (
        <div className="min-h-screen bg-slate-950 py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
                        Bot Caption Jualan 🤖
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Nggak perlu pusing mikirin kata-kata. Cukup isi data, pilih template, dan copy caption jualanmu yang siap convert!
                    </p>
                </div>

                <CaptionGenerator />

                <div className="mt-16 text-center text-sm text-gray-600 max-w-2xl mx-auto">
                    <p>
                        Tips: Gunakan variasi template yang berbeda untuk setiap customer agar tidak terdeteksi spam oleh WhatsApp.
                    </p>
                </div>
            </div>
        </div>
    )
}
