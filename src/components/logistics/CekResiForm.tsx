'use client'

import { useState } from 'react'
import Select from 'react-select'
import { motion, AnimatePresence } from 'framer-motion'
import { courierList } from '@/data/couriers'
import { trackResi, type TrackResiResult } from '@/app/actions/logistics'
import { TrackingResults } from './TrackingResults'
import { Loader2, Search } from 'lucide-react'

const courierOptions = courierList.map((courier) => ({
    value: courier.code,
    label: courier.name,
    courier,
}))

const customSelectStyles = {
    control: (base: any) => ({
        ...base,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '6px',
        boxShadow: 'none',
        '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.5)',
        },
    }),
    menu: (base: any) => ({
        ...base,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isFocused ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
        color: '#fff',
        '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
        },
    }),
    singleValue: (base: any) => ({
        ...base,
        color: '#fff',
    }),
    input: (base: any) => ({
        ...base,
        color: '#fff',
    }),
    placeholder: (base: any) => ({
        ...base,
        color: 'rgba(255, 255, 255, 0.5)',
    }),
}

export function CekResiForm() {
    const [courier, setCourier] = useState<any>(null)
    const [waybill, setWaybill] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<TrackResiResult | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!courier || !waybill) {
            setResult({
                success: false,
                error: 'Mohon lengkapi semua field',
            })
            return
        }

        setIsLoading(true)
        setResult(null)

        try {
            const res = await trackResi({
                courierCode: courier.value,
                resiNumber: waybill.trim(),
            })
            setResult(res)
        } catch (error) {
            setResult({
                success: false,
                error: 'Terjadi kesalahan',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit}
                className="glass-card p-6 space-y-5"
            >
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Pilih Kurir
                    </label>
                    <Select
                        options={courierOptions}
                        value={courier}
                        onChange={setCourier}
                        placeholder="Pilih kurir pengiriman..."
                        styles={customSelectStyles}
                        className="text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Nomor Resi
                    </label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={waybill}
                            onChange={(e) => setWaybill(e.target.value.toUpperCase())}
                            placeholder="Contoh: JNE123456789"
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all uppercase"
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        Masukkan nomor resi paket Anda (minimal 8 karakter)
                    </p>
                </div>

                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Melacak Paket...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Lacak Paket
                        </>
                    )}
                </motion.button>
            </motion.form>

            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TrackingResults result={result} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
