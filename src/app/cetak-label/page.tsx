import { Metadata } from 'next'
import LabelGeneratorWrapper from '@/components/label/LabelGeneratorWrapper'

export const metadata: Metadata = {
    title: 'Cetak Label Pengiriman Gratis (Thermal A6) - CekKirim',
    description: 'Tools gratis untuk membuat dan cetak label resi pengiriman online shop. Format Thermal A6 (100x150mm), support barcode dan simpan data pengirim otomatis.',
    keywords: ['cetak label pengiriman', 'resi thermal', 'label a6', 'cetak resi', 'generator label resi'],
}

export default function CetakLabelPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4 md:px-6">
            <LabelGeneratorWrapper />
        </div>
    )
}
