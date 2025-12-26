'use client'

import { motion } from 'framer-motion'
import { Check, X, Zap, Crown, Sparkles, MessageCircle } from 'lucide-react'
import { pricingPlans, getPlanById, generateWhatsAppUpgradeUrl } from '@/lib/payment'

export default function PricingPage() {
    const freePlan = getPlanById('free')
    const monthlyPlan = getPlanById('pro-monthly')
    const yearlyPlan = getPlanById('pro-yearly')
    const lifetimePlan = getPlanById('pro-lifetime')

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Pilih Paket <span className="gradient-text">CekKirim</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Upgrade ke Pro untuk pengalaman tracking tanpa batas dan tanpa iklan
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6 relative"
                    >
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Gratis</h3>
                            <p className="text-gray-400 text-sm">Untuk penggunaan dasar</p>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">Rp 0</span>
                            <span className="text-gray-400">/bulan</span>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <FeatureItem included>Cek resi semua kurir</FeatureItem>
                            <FeatureItem included>Cek ongkir dasar</FeatureItem>
                            <FeatureItem included={false}>Maksimal 10x/hari</FeatureItem>
                            <FeatureItem included={false}>Dengan iklan</FeatureItem>
                            <FeatureItem included={false}>AI Assistant terbatas</FeatureItem>
                        </ul>

                        <button className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium">
                            Paket Saat Ini
                        </button>
                    </motion.div>

                    {/* Monthly Pro - POPULAR */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 relative border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/10"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-full">
                                ⭐ Populer
                            </span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Pro Bulanan
                            </h3>
                            <p className="text-gray-400 text-sm">Untuk pengguna aktif</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-white">Rp 29K</span>
                                <span className="text-gray-400">/bulan</span>
                            </div>
                            <p className="text-green-400 text-sm mt-1">
                                <s className="text-gray-500">Rp 49K</s> Hemat 40%
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <FeatureItem included>Tracking unlimited</FeatureItem>
                            <FeatureItem included>Tanpa iklan</FeatureItem>
                            <FeatureItem included>AI Assistant unlimited</FeatureItem>
                            <FeatureItem included>Share as Image</FeatureItem>
                            <FeatureItem included>Riwayat tersimpan</FeatureItem>
                            <FeatureItem included>Prioritas support</FeatureItem>
                        </ul>

                        <a
                            href={monthlyPlan ? generateWhatsAppUpgradeUrl(monthlyPlan) : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Upgrade via WA
                        </a>
                    </motion.div>

                    {/* Yearly Pro */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6 relative"
                    >
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Crown className="w-5 h-5 text-yellow-500" />
                                Pro Tahunan
                            </h3>
                            <p className="text-gray-400 text-sm">Best value</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-white">Rp 199K</span>
                                <span className="text-gray-400">/tahun</span>
                            </div>
                            <p className="text-green-400 text-sm mt-1">
                                <s className="text-gray-500">Rp 348K</s> Hemat 43%
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <FeatureItem included>Semua fitur Pro</FeatureItem>
                            <FeatureItem included>Hemat 43% vs bulanan</FeatureItem>
                            <FeatureItem included>Badge Pro Member</FeatureItem>
                            <FeatureItem included>Early access fitur baru</FeatureItem>
                            <FeatureItem included>API access (soon)</FeatureItem>
                        </ul>

                        <a
                            href={yearlyPlan ? generateWhatsAppUpgradeUrl(yearlyPlan) : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Upgrade via WA
                        </a>
                    </motion.div>

                    {/* Lifetime */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6 relative bg-gradient-to-br from-slate-800/50 to-purple-900/30"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-full">
                                🎁 Limited
                            </span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                Pro Lifetime
                            </h3>
                            <p className="text-gray-400 text-sm">Sekali bayar, selamanya</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-white">Rp 499K</span>
                                <span className="text-gray-400">sekali</span>
                            </div>
                            <p className="text-green-400 text-sm mt-1">
                                <s className="text-gray-500">Rp 999K</s> Hemat 50%
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <FeatureItem included>Akses selamanya</FeatureItem>
                            <FeatureItem included>Semua fitur Pro</FeatureItem>
                            <FeatureItem included>Semua update gratis</FeatureItem>
                            <FeatureItem included>Prioritas support forever</FeatureItem>
                            <FeatureItem included>API access priority</FeatureItem>
                        </ul>

                        <a
                            href={lifetimePlan ? generateWhatsAppUpgradeUrl(lifetimePlan) : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Upgrade via WA
                        </a>
                    </motion.div>
                </div>

                {/* Feature Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-8 overflow-x-auto"
                >
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        Perbandingan Fitur
                    </h2>

                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4 text-gray-400 font-medium">Fitur</th>
                                <th className="text-center py-4 px-4 text-gray-400 font-medium">Free</th>
                                <th className="text-center py-4 px-4 text-indigo-400 font-medium">Pro</th>
                            </tr>
                        </thead>
                        <tbody>
                            <ComparisonRow feature="Cek Resi" free="✅" pro="✅ Unlimited" />
                            <ComparisonRow feature="Cek Ongkir" free="✅" pro="✅ Semua kurir" />
                            <ComparisonRow feature="AI Assistant" free="3x/hari" pro="✅ Unlimited" />
                            <ComparisonRow feature="Share as Image" free="❌" pro="✅" />
                            <ComparisonRow feature="Tanpa Iklan" free="❌" pro="✅" />
                            <ComparisonRow feature="Riwayat Tracking" free="7 hari" pro="✅ Selamanya" />
                            <ComparisonRow feature="Prioritas Support" free="❌" pro="✅ 24 jam" />
                            <ComparisonRow feature="API Access" free="❌" pro="✅ Coming Soon" />
                        </tbody>
                    </table>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16"
                >
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        Pertanyaan Umum
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FAQItem
                            question="Bagaimana cara pembayarannya?"
                            answer="Saat ini pembayaran dilakukan via WhatsApp ke admin kami. Kami menerima transfer bank (BCA, Mandiri) dan e-wallet (GoPay, OVO, DANA)."
                        />
                        <FAQItem
                            question="Apakah ada jaminan uang kembali?"
                            answer="Ya! Jika tidak puas dalam 7 hari pertama, kami akan refund 100% tanpa pertanyaan."
                        />
                        <FAQItem
                            question="Bagaimana cara mengaktifkan Pro?"
                            answer="Setelah pembayaran dikonfirmasi, akun Anda akan di-upgrade dalam waktu maksimal 1x24 jam."
                        />
                        <FAQItem
                            question="Apakah bisa upgrade dari bulanan ke tahunan?"
                            answer="Tentu! Anda akan mendapat potongan proporsional dari sisa masa aktif bulanan Anda."
                        />
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 text-center"
                >
                    <p className="text-gray-400 mb-4">
                        Punya pertanyaan? Hubungi kami di WhatsApp
                    </p>
                    <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-medium"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Chat dengan Admin
                    </a>
                </motion.div>
            </div>
        </div>
    )
}

// Helper Components
function FeatureItem({ children, included }: { children: React.ReactNode; included: boolean }) {
    return (
        <li className="flex items-center gap-2 text-sm">
            {included ? (
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
                <X className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
            <span className={included ? 'text-gray-300' : 'text-gray-500'}>{children}</span>
        </li>
    )
}

function ComparisonRow({ feature, free, pro }: { feature: string; free: string; pro: string }) {
    return (
        <tr className="border-b border-white/5">
            <td className="py-4 px-4 text-white">{feature}</td>
            <td className="py-4 px-4 text-center text-gray-400">{free}</td>
            <td className="py-4 px-4 text-center text-green-400 font-medium">{pro}</td>
        </tr>
    )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    return (
        <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-2">{question}</h3>
            <p className="text-gray-400 text-sm">{answer}</p>
        </div>
    )
}
