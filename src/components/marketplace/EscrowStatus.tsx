'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Clock, CheckCircle } from 'lucide-react'
import { releaseFunds } from '@/app/actions/escrow'
import { toast } from 'sonner'
import { useState } from 'react'

export function EscrowStatus({ transaction }: { transaction: any }) {
    const [loading, setLoading] = useState(false)

    const handleRelease = async () => {
        if (!confirm('Anda yakin pekerjaan sudah selesai sesuai? Dana akan diteruskan ke Vendor.')) return

        setLoading(true)
        const res = await releaseFunds(transaction.id)
        if (res.success) {
            toast.success('Dana berhasil diteruskan!')
            window.location.reload()
        } else {
            toast.error('Gagal memproses.')
        }
        setLoading(false)
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PAID_HELD': return { icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Dana Diamankan (Rekber)' }
            case 'WORK_SUBMITTED': return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Menunggu Konfirmasi Anda' }
            case 'COMPLETED': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Transaksi Selesai' }
            default: return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: status }
        }
    }

    const info = getStatusInfo(transaction.status)
    const StatusIcon = info.icon

    return (
        <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${info.bg}`}>
                    <StatusIcon className={`w-6 h-6 ${info.color}`} />
                </div>
                <div>
                    <h4 className="font-bold text-lg">Rp {transaction.amount.toLocaleString()}</h4>
                    <p className={`font-medium ${info.color}`}>{info.label}</p>
                    <p className="text-xs text-gray-400">ID: {transaction.id}</p>
                </div>
            </div>

            {transaction.status === 'WORK_SUBMITTED' && (
                <div className="flex gap-2">
                    <Button variant="outline">Komplain</Button>
                    <Button onClick={handleRelease} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        Terima & Lepas Dana
                    </Button>
                </div>
            )}
        </Card>
    )
}
