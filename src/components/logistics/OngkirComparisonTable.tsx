'use client'

import { OngkirRate } from '@/app/actions/logistics'
import { CheckCircle, Clock, DollarSign, Package, Trophy, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface OngkirComparisonTableProps {
    data: OngkirRate[]
    origin: string
    destination: string
    className?: string
}

export function OngkirComparisonTable({ data, origin, destination, className = '' }: OngkirComparisonTableProps) {
    // 1. Logic to find highlights
    const sortedByPrice = [...data].sort((a, b) => a.price - b.price)
    const sortedBySpeed = [...data].sort((a, b) => {
        // Parse ETD "1-2" -> 1.5 avg
        const getAvg = (s: string) => {
            const parts = s.split('-').map(p => parseInt(p.replace(/\D/g, '')))
            if (parts.length === 0 || isNaN(parts[0])) return 999
            return parts.length > 1 ? (parts[0] + parts[1]) / 2 : parts[0]
        }
        return getAvg(a.estimatedDays) - getAvg(b.estimatedDays)
    })

    const cheapestRate = sortedByPrice[0]
    const fastestRate = sortedBySpeed[0]

    // 2. Helper to check badges
    const isCheapest = (rate: OngkirRate) => rate.id === cheapestRate.id
    const isFastest = (rate: OngkirRate) => rate.id === fastestRate.id

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full">
                        <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Paling Hemat</p>
                        <p className="text-white font-bold text-lg">{cheapestRate.courier} - {cheapestRate.service}</p>
                        <p className="text-green-400 font-semibold">{formatCurrency(cheapestRate.price)}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-full">
                        <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Paling Cepat</p>
                        <p className="text-white font-bold text-lg">{fastestRate.courier} - {fastestRate.service}</p>
                        <p className="text-purple-400 font-semibold">{fastestRate.estimatedDays} Hari</p>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="glass-card overflow-hidden rounded-xl border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 text-gray-400 font-medium text-sm">Kurir</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Layanan</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Estimasi</th>
                                <th className="p-4 text-gray-400 font-medium text-sm">Tarif</th>
                                <th className="p-4 text-gray-400 font-medium text-sm text-center">Keunggulan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedByPrice.map((rate, index) => (
                                <tr key={rate.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {/* We could add logos here if map available */}
                                            <span className="font-bold text-white tracking-wide">{rate.courier}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <span className="text-white font-medium block">{rate.service}</span>
                                            <span className="text-xs text-gray-500">{rate.description}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            {rate.estimatedDays} Hari
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-white font-bold text-lg tracking-tight">
                                            {formatCurrency(rate.price)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col gap-2 items-center justify-center">
                                            {isCheapest(rate) && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                                                    <Trophy className="w-3 h-3" />
                                                    Juara Murah
                                                </span>
                                            )}
                                            {isFastest(rate) && !isCheapest(rate) && ( // If both, cheapest usually wins visually, or stack them
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30">
                                                    <Zap className="w-3 h-3" />
                                                    Juara Kilat
                                                </span>
                                            )}
                                            {isFastest(rate) && isCheapest(rate) && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30 mt-1">
                                                    <Zap className="w-3 h-3" />
                                                    Juara Kilat
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-center text-xs text-gray-500">
                *Harga dapat berubah sewaktu-waktu tanpa pemberitahuan.
            </p>
        </div>
    )
}
