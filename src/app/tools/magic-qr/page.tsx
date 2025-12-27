import MagicQrGenerator from '@/components/tools/MagicQrGenerator'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Magic QR Code Generator | CekKirim.com',
    description: 'Buat stiker QR Code ajaib untuk paket Anda. Scan untuk langsung melacak resi pengiriman.',
}

export default function MagicQrPage() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container-custom py-12">
                <MagicQrGenerator />
            </div>
        </div>
    )
}
