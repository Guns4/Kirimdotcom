import { Wrench } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'System Maintenance - CekKirim',
    description: 'Kami sedang melakukan perbaikan sistem.',
    robots: {
        index: false,
        follow: false
    }
}

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                    <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-full flex items-center justify-center">
                        <Wrench className="w-10 h-10 text-indigo-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white">
                        Sedang Dalam Perbaikan
                    </h1>
                    <p className="text-gray-400">
                        Kami sedang melakukan pemeliharaan sistem darurat untuk meningkatkan performa dan keamanan.
                        Website akan segera kembali normal.
                    </p>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-200 text-sm">
                        Estimasi kembali online: <span className="font-bold">Segera</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
