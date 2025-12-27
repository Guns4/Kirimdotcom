'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Send, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react'
import { requestDisputeOtp, verifyDisputeOtp, submitDispute } from '@/app/actions/dispute'
import { toast } from 'sonner'

interface DisputeWizardProps {
    phoneHash: string
    onClose: () => void
}

export function DisputeWizard({ phoneHash, onClose }: DisputeWizardProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1) // 1: OTP, 2: Form, 3: Success
    const [rawPhone, setRawPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [reason, setReason] = useState('')
    const [contact, setContact] = useState('')
    const [loading, setLoading] = useState(false)

    // Step 1: Request OTP
    const handleRequestOtp = async () => {
        setLoading(true)
        const res = await requestDisputeOtp(rawPhone)
        setLoading(false)
        if (res.success) {
            toast.success(res.message)
            // Focus OTP input logic here if needed
        } else {
            toast.error(res.error)
        }
    }

    // Step 1b: Verify OTP
    const handleVerifyOtp = async () => {
        setLoading(true)
        const res = await verifyDisputeOtp(rawPhone, otp)
        setLoading(false)

        if (res.success) {
            setStep(2)
            setContact(rawPhone) // Auto-fill contact
        } else {
            toast.error(res.error)
        }
    }

    // Step 2: Submit Dispute
    const handleSubmit = async () => {
        if (!reason || reason.length < 10) {
            toast.error('Mohon jelaskan alasan lebih detail')
            return
        }

        setLoading(true)
        const res = await submitDispute(phoneHash, reason, contact)
        setLoading(false)

        if (res.success) {
            setStep(3)
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-semibold text-white">Ajukan Pemutihan</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode='wait'>
                        {/* STEP 1: Verification */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-sm text-indigo-200">
                                    Untuk mencegah penyalahgunaan, mohon verifikasi bahwa nomor ini adalah milik Anda.
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Nomor WhatsApp / HP</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="tel"
                                            value={rawPhone}
                                            onChange={(e) => setRawPhone(e.target.value)}
                                            placeholder="08123..."
                                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                        />
                                        <button
                                            onClick={handleRequestOtp}
                                            disabled={loading || rawPhone.length < 10}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {loading ? '...' : 'Kirim OTP'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Kode OTP (Mock: 123456)</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Masukkan 6 digit kode"
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 text-center tracking-widest text-lg"
                                        maxLength={6}
                                    />
                                </div>

                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={loading || otp.length !== 6}
                                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors mt-4"
                                >
                                    {loading ? 'Memverifikasi...' : 'Lanjut ke Pengajuan'}
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 2: Detail Form */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Alasan Sanggahan</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Contoh: Paket sebenarnya sudah diterima tapi status kurir salah update..."
                                        className="w-full h-32 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Kontak Dihubungi (Email/WA)</label>
                                    <input
                                        type="text"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !reason}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? 'Mengirim...' : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Kirim Sanggahan
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* STEP 3: Success */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Permintaan Terkirim!</h4>
                                <p className="text-gray-400 text-sm mb-6">
                                    Tim kami akan meninjau laporan Anda. Jika disetujui, label risiko akan dihapus dalam 1x24 jam.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                                >
                                    Tutup
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
