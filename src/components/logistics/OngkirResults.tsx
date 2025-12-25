'use client'

import { motion } from 'framer-motion'
import { CheckOngkirResult, generateAIInsight } from '@/app/actions/logistics'
import { Truck, Clock, AlertCircle, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { AdPlaceholder } from '@/components/ads/AdPlaceholder'
import { AffiliateButton } from '@/components/affiliate/AffiliateButton'

interface OngkirResultsProps {
    result: CheckOngkirResult
}

export function OngkirResults({ result }: OngkirResultsProps) {
    if (!result.success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 border-red-500/30"
            >
                <div className="flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                        <p className="font-semibold">Gagal Mengecek Ongkir</p>
                        <p className="text-sm text-red-300">{result.error}</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    if (!result.data || result.data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6"
            >
                <p className="text-center text-gray-400">Tidak ada hasil ditemukan</p>
            </motion.div>
        )
    }

    return (
        <div className="space-y-4">
            {/* AI Insight */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30"
            >
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-purple-300 mb-1">AI Insight</p>
                        <p className="text-sm text-gray-300">
                            {generateAIInsight({
                                type: 'ongkir',
                                data: result.data[0],
                            })}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                    Ditemukan {result.data.length} Layanan
                </h3>
            </div>

            {/* Ad Placement - Top */}
            <AdPlaceholder slot="top" />

            {/* Results Grid */}
            <div className="grid gap-4">
                {result.data.map((service, index) => (
                    <>
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="glass-card p-5 hover:border-indigo-500/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between gap-4">
                                {/* Courier Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Logo placeholder */}
                                    <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                                        <Truck className="w-8 h-8 text-indigo-400" />
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-bold text-white text-lg">
                                            {service.courier}
                                        </h4>
                                        <p className="text-sm text-gray-400">{service.service}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${service.serviceType === 'Express'
                                                    ? 'bg-orange-500/20 text-orange-300'
                                                    : 'bg-blue-500/20 text-blue-300'
                                                    }`}
                                            >
                                                {service.serviceType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price & Estimate */}
                                <div className="text-right flex-shrink-0">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        Rp {(service as any).price.toLocaleString('id-ID')}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <span>{service.estimatedDays}</span>
                                    </div>
                                </div>

                                {/* Affiliate Button */}
                                <AffiliateButton
                                    courier={service.courierCode}
                                    service={service.service}
                                    price={(service as any).price}
                                />
                            </div>

                            {/* Description */}
                            <p className="mt-3 text-sm text-gray-400 border-t border-white/5 pt-3">
                                {service.description}
                            </p>
                        </motion.div>

                        {/* Ad Placement - Middle (after 3rd item) */}
                        {index === 2 && <AdPlaceholder slot="middle" key={`ad-${index}`} />}
                    </>
                ))}
            </div>
        </div>
    )
}
