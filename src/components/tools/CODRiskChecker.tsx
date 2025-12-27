'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Phone, ShieldAlert, BadgeInfo, TriangleAlert, CheckCircle2, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { sha256, normalizePhone } from '@/lib/hash'
import { checkPostalCode, checkPhone, reportBuyer } from '@/app/actions/cod'

type Tab = 'postal' | 'phone'

export function CODRiskChecker() {
    const [activeTab, setActiveTab] = useState<Tab>('postal')

    // Postal State
    const [postalCode, setPostalCode] = useState('')
    const [postalResult, setPostalResult] = useState<any>(null)
    const [postalLoading, setPostalLoading] = useState(false)

    // Phone State
    const [phoneNumber, setPhoneNumber] = useState('')
    const [phoneResult, setPhoneResult] = useState<any>(null)
    const [phoneLoading, setPhoneLoading] = useState(false)

    // Report State
    const [showReportForm, setShowReportForm] = useState(false)
    const [reportReason, setReportReason] = useState('Menolak Bayar (RTS)')
    const [reportLoading, setReportLoading] = useState(false)

    // Handlers
    const handleCheckPostal = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!postalCode || postalCode.length < 5) {
            toast.error('Masukkan 5 digit kode pos')
            return
        }

        setPostalLoading(true)
        setPostalResult(null)
        try {
            const res = await checkPostalCode(postalCode)
            if (res.success) {
                setPostalResult(res)
            } else {
                toast.error(res.error || 'Terjadi kesalahan')
                setPostalResult({ error: res.error })
            }
        } catch (error) {
            toast.error('Gagal memuat data')
        } finally {
            setPostalLoading(false)
        }
    }

    const handleCheckPhone = async (e: React.FormEvent) => {
        e.preventDefault()
        const normalized = normalizePhone(phoneNumber)
        if (!normalized) {
            toast.error('Format nomor HP tidak valid (min. 10 digit)')
            return
        }

        setPhoneLoading(true)
        setPhoneResult(null)
        try {
            const hash = await sha256(normalized)
            const res = await checkPhone(hash)
            if (res.success) {
                setPhoneResult({ ...res, original: phoneNumber })
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error('Gagal mengecek nomor')
        } finally {
            setPhoneLoading(false)
        }
    }

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const normalized = normalizePhone(phoneNumber)
        if (!normalized) {
            toast.error('Nomor HP tidak valid')
            return
        }

        setReportLoading(true)
        try {
            const hash = await sha256(normalized)
            const res = await reportBuyer(hash, reportReason)
            if (res.success) {
                toast.success('Laporan berhasil dikirim! Terima kasih.')
                setShowReportForm(false)
                // Refresh check
                handleCheckPhone({ preventDefault: () => { } } as any)
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error('Gagal mengirim laporan')
        } finally {
            setReportLoading(false)
        }
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'High': return 'text-red-400 bg-red-500/20 border-red-500/50'
            case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
            case 'Low': return 'text-green-400 bg-green-500/20 border-green-500/50'
            default: return 'text-gray-400 bg-gray-500/20'
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                    onClick={() => setActiveTab('postal')}
                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${activeTab === 'postal'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <MapPin className="w-4 h-4" />
                    Cek Area
                </button>
                <button
                    onClick={() => setActiveTab('phone')}
                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${activeTab === 'phone'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Phone className="w-4 h-4" />
                    Cek Buyer
                </button>
            </div>

            {/* Content Area */}
            <div className="glass-card p-6 md:p-8 min-h-[300px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'postal' ? (
                        <motion.div
                            key="postal"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Cek Risiko Wilayah</h2>
                                <p className="text-gray-400">Ketahui tingkat retur COD berdasarkan statistik kode pos.</p>
                            </div>

                            <form onSubmit={handleCheckPostal} className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={5}
                                    placeholder="Contoh: 12345"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-lg text-center tracking-widest"
                                />
                                <button
                                    type="submit"
                                    disabled={postalLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {postalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    <span className="hidden md:inline">Cek</span>
                                </button>
                            </form>

                            {postalResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-6 rounded-xl border-2 text-center ${postalResult.error
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : getRiskColor(postalResult.riskLevel)
                                        }`}
                                >
                                    {postalResult.error ? (
                                        <div className="text-red-300 flex flex-col items-center gap-2">
                                            <TriangleAlert className="w-8 h-8" />
                                            <p>{postalResult.error}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-lg font-medium mb-1 opacity-80">TINGKAT RISIKO</div>
                                            <div className="text-4xl font-bold mb-4">{postalResult.riskLevel?.toUpperCase()}</div>

                                            <div className="flex items-center justify-center gap-2 text-sm opacity-70 border-t border-white/10 pt-4 mt-4">
                                                <MapPin className="w-4 h-4" />
                                                <span>{postalResult.city}, {postalResult.province}</span>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="phone"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Cek Reputasi Buyer</h2>
                                <p className="text-gray-400">Cek apakah nomor HP pernah dilaporkan melakukan penolakan paket.</p>
                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                                    <ShieldAlert className="w-3 h-3" />
                                    <span>Privacy Safe: Nomor HP di-hash (SHA256)</span>
                                </div>
                            </div>

                            <form onSubmit={handleCheckPhone} className="relative">
                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        placeholder="0812xxxx"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-lg"
                                    />
                                    <button
                                        type="submit"
                                        disabled={phoneLoading}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {phoneLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                        <span className="hidden md:inline">Cek</span>
                                    </button>
                                </div>
                            </form>

                            {phoneResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-6 rounded-xl border text-center relative overflow-hidden ${phoneResult.isClean
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-red-500/10 border-red-500/30'
                                        }`}
                                >
                                    {phoneResult.isClean ? (
                                        <div className="space-y-3">
                                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-green-400">Belum Ada Laporan</h3>
                                            <p className="text-gray-400 text-sm">Nomor ini belum pernah dilaporkan menolak paket di database kami.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                                                <TriangleAlert className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-red-400">{phoneResult.reportCount}x Dilaporkan</h3>
                                                <p className="text-xs text-red-300/70 mt-1">Terakhir: {new Date(phoneResult.lastReportedAt).toLocaleDateString()}</p>
                                            </div>
                                            <p className="text-gray-300 text-sm border-t border-red-500/20 pt-4 mt-2">
                                                Harap waspada jika mengirim COD ke nomor ini.
                                            </p>
                                        </div>
                                    )}

                                    {/* Report Trigger */}
                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => setShowReportForm(!showReportForm)}
                                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <BadgeInfo className="w-4 h-4" />
                                            Laporkan Nomor Ini?
                                        </button>
                                    </div>

                                    {/* Inline Report Form */}
                                    <AnimatePresence>
                                        {showReportForm && (
                                            <motion.form
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-4 pt-4 border-t border-dashed border-white/20 text-left overflow-hidden"
                                                onSubmit={handleReportSubmit}
                                            >
                                                <label className="block text-sm text-gray-400 mb-2">Alasan Laporan</label>
                                                <select
                                                    value={reportReason}
                                                    onChange={(e) => setReportReason(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white mb-3 focus:outline-none focus:border-indigo-500"
                                                >
                                                    <option>Menolak Bayar (RTS)</option>
                                                    <option>Alamat Palsu / Fiktif</option>
                                                    <option>Penipuan / Fraud</option>
                                                    <option>Lainnya</option>
                                                </select>
                                                <button
                                                    type="submit"
                                                    disabled={reportLoading}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                                                >
                                                    {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                    Kirim Laporan
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2 text-center">
                                                    Laporan Anda akan dicatat secara anonim.
                                                </p>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
