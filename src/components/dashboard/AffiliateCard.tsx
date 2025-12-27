'use client'

import { useEffect, useState } from 'react'
import { getReferralData } from '@/app/actions/referral'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Users, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

export function AffiliateCard() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        getReferralData().then(setData)
    }, [])

    if (!data) return null

    const copyLink = () => {
        navigator.clipboard.writeText(data.link)
        toast.success('Link referral disalin!')
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <DollarSign className="w-5 h-5" /> Affiliate Program
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">
                    Ajak teman pakai Premium dan dapatkan komisi <span className="text-white font-bold">20% selamanya</span>.
                </p>

                <div className="flex gap-2">
                    <Input value={data.link} readOnly className="bg-black/20 border-white/10 text-white" />
                    <Button variant="secondary" onClick={copyLink}>
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/10 p-3 rounded-lg text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                        <div className="text-xl font-bold">{data.total_referred}</div>
                        <div className="text-xs text-gray-400">Teman Diajak</div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg text-center">
                        <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-400" />
                        <div className="text-xl font-bold">Rp {data.total_earnings.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Komisi Cair</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
