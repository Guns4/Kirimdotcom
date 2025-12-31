'use client';

import { WarrantyCamera } from '@/components/features/warranty/WarrantyCamera';

export default function WarrantyPage() {
    return (
        <div className="p-4 space-y-4">
            <h1 className="text-lg font-bold">Simpan Garansi Digital</h1>
            <WarrantyCamera onCapture={() => { }} />
            <p className="text-xs text-gray-400">
                *Fitur ini akan menyimpan foto ke Cloud aman kami.
            </p>
        </div>
    );
}
