'use client'

import { useState } from 'react'
import { AlertTriangle, MapPin, Loader2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { reportIssue, type IssueType } from '@/app/actions/issues'
import * as Dialog from '@radix-ui/react-dialog'

interface IssueReportButtonProps {
    city?: string // Auto-fill from tracking data if available
}

export function IssueReportButton({ city = '' }: IssueReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedType, setSelectedType] = useState<IssueType | null>(null)
    const [inputCity, setInputCity] = useState(city)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async () => {
        if (!selectedType || !inputCity) return

        setIsSubmitting(true)
        try {
            await reportIssue({
                city: inputCity,
                type: selectedType
            })
            setIsSuccess(true)
            setTimeout(() => {
                setIsOpen(false)
                setIsSuccess(false)
                setSelectedType(null)
            }, 2000)
        } finally {
            setIsSubmitting(false)
        }
    }

    const issues = [
        { id: 'FIX_FLOOD', label: 'Banjir / Bencana', icon: '🌊' },
        { id: 'FIX_STRIKE', label: 'Kurir Mogok', icon: '🛑' },
        { id: 'FIX_OVERLOAD', label: 'Gudang Overload', icon: '📦' },
        { id: 'FIX_ADDRESS', label: 'Alamat Susah', icon: '🗺️' },
    ]

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors font-medium my-2"
            >
                <AlertTriangle className="w-3 h-3" />
                Lapor Gangguan di Lokasi
            </button>

            <AnimatePresence>
                {isOpen && (
                    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-2xl border border-gray-100 dark:border-slate-800"
                                >
                                    {isSuccess ? (
                                        <div className="text-center py-8">
                                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Laporan Diterima</h3>
                                            <p className="text-sm text-gray-500 mt-2">Terima kasih telah membantu komunitas logistik!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <div>
                                                    <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                                                        Lapor Gangguan
                                                    </Dialog.Title>
                                                    <Dialog.Description className="text-sm text-gray-500">
                                                        Bantu user lain mengetahui kendala pengiriman di daerahmu.
                                                    </Dialog.Description>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={inputCity}
                                                        onChange={(e) => setInputCity(e.target.value)}
                                                        placeholder="Ketik Nama Kota/Kecamatan..."
                                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis Gangguan</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {issues.map((issue) => (
                                                        <button
                                                            key={issue.id}
                                                            onClick={() => setSelectedType(issue.id as IssueType)}
                                                            className={`p-3 rounded-lg border text-left transition-all ${selectedType === issue.id
                                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500'
                                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                                }`}
                                                        >
                                                            <div className="text-xl mb-1">{issue.icon}</div>
                                                            <div className="text-xs font-medium">{issue.label}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="pt-2 flex gap-3">
                                                <button
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex-1 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting || !selectedType || !inputCity}
                                                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : 'Kirim Laporan'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>
                )}
            </AnimatePresence>
        </>
    )
}
