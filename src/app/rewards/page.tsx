'use client'

import { useState, useEffect } from 'react'
import { getRewards, redeemReward } from '@/app/actions/rewards'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CoinBalance } from '@/components/loyalty/CoinBalance'
import { Gift, Zap } from 'lucide-react'

export default function RewardsPage() {
    const [rewards, setRewards] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRewards().then(data => {
            setRewards(data)
            setLoading(false)
        })
    }, [])

    const handleRedeem = async (item: any) => {
        if (!confirm(`Tukar ${item.cost_points} poin untuk ${item.title}?`)) return
        
        try {
            const res = await redeemReward(item.id)
            if (res.success) {
                toast.success('Berhasil ditukar!', { description: `Kode voucher Anda: ${res.code}` })
            }
        } catch (e: any) {
            toast.error(e.message || 'Gagal menukar poin')
        }
    }

    return (
        <div className="container-custom py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Rewards Catalog</h1>
                    <p className="text-gray-500">Tukarkan poin aktivitasmu dengan hadiah menarik.</p>
                </div>
                <CoinBalance />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rewards.map(item => (
                    <Card key={item.id} className="hover:shadow-lg transition-all border-indigo-50">
                        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                            <Gift className="w-12 h-12 opacity-80" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                            <div className="flex items-center gap-1 font-bold text-yellow-600 bg-yellow-50 w-fit px-2 py-1 rounded text-sm">
                                <Zap className="w-4 h-4" />
                                {item.cost_points} Poin
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleRedeem(item)}>Tukar Sekarang</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
