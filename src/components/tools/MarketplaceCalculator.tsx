'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { MARKETPLACE_FEES } from '@/data/marketplace-fees'
import { Calculator, DollarSign, Package, ShoppingBag, ExternalLink, Info } from 'lucide-react'
import Select from 'react-select'

// Custom styles for React Select
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
        zIndex: 50,
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isFocused ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
        color: '#fff',
        cursor: 'pointer',
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
}

const COLORS = ['#10B981', '#F59E0B', '#6366F1', '#EF4444']; // Green (Profit), Yellow (Cost), Indigo (Admin), Red (Shipping)

export function MarketplaceCalculator() {
    const [price, setPrice] = useState<number | ''>(100000)
    const [cost, setCost] = useState<number | ''>(50000) // Modal
    const [shipping, setShipping] = useState<number | ''>(0) // Ongkir (usually paid by buyer, but sometimes impactful if free shipping fee calculated based on it or subsidi)
    // NOTE: Free shipping fees are usually calculated based on Product Price in Shopee, not actual shipping cost.
    // However, some sellers cover partial shipping. We focus on Admin Fees here.

    const [selectedPlatform, setSelectedPlatform] = useState<any>(null)
    const [selectedTier, setSelectedTier] = useState<any>(null)

    // Prepare platform options
    const platformOptions = useMemo(() =>
        MARKETPLACE_FEES.map(p => ({ value: p.id, label: p.name, data: p })),
        [])

    // Prepare tier options based on platform
    const tierOptions = useMemo(() => {
        if (!selectedPlatform) return []
        return selectedPlatform.data.tiers.map((t: any) => ({ value: t.id, label: t.name, data: t }))
    }, [selectedPlatform])

    // Calculation Logic
    const result = useMemo(() => {
        const valPrice = Number(price) || 0
        const valCost = Number(cost) || 0
        const valShipping = Number(shipping) || 0

        if (!selectedTier) {
            return {
                adminFee: 0,
                paymentFee: 0,
                freeShippingFee: 0,
                totalDeduction: 0,
                netPayout: 0,
                netProfit: 0,
                margin: 0
            }
        }

        const tier = selectedTier.data

        // Detailed Fees
        const adminFee = (valPrice * tier.adminFee) / 100
        const paymentFee = (valPrice * tier.paymentFee) / 100
        const fsFee = tier.freeShippingFee ? (valPrice * tier.freeShippingFee) / 100 : 0

        // Total Marketplace Cuts
        const totalFees = adminFee + paymentFee + fsFee

        // Seller Receives (Omzet Bersih dari MP)
        const netPayout = valPrice - totalFees

        // Seller Profit (Net Payout - COGS)
        const netProfit = netPayout - valCost

        // Margin
        const margin = valPrice > 0 ? (netProfit / valPrice) * 100 : 0

        return {
            adminFee,
            paymentFee,
            freeShippingFee: fsFee,
            totalDeduction: totalFees,
            netPayout,
            netProfit,
            margin
        }
    }, [price, cost, shipping, selectedTier])

    // Chart Data
    const chartData = useMemo(() => {
        if (!selectedTier || !price) return []
        return [
            { name: 'Modal Produk', value: Number(cost) || 0 },
            { name: 'Est. Profit Bersih', value: result.netProfit > 0 ? result.netProfit : 0 },
            { name: 'Biaya Admin & Layanan', value: result.totalDeduction },
        ]
    }, [result, cost, price, selectedTier])


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 space-y-6"
            >
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-indigo-400" />
                    Parameter Penjualan
                </h2>

                {/* Platform Selection */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Marketplace</label>
                        <Select
                            options={platformOptions}
                            value={selectedPlatform}
                            onChange={(opt) => {
                                setSelectedPlatform(opt)
                                setSelectedTier(null) // Reset tier when platform changes
                            }}
                            placeholder="Pilih Marketplace..."
                            styles={customSelectStyles}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Level Toko (Status)</label>
                        <Select
                            options={tierOptions}
                            value={selectedTier}
                            onChange={setSelectedTier}
                            placeholder={selectedPlatform ? "Pilih Status Toko..." : "Pilih Marketplace Dulu"}
                            isDisabled={!selectedPlatform}
                            styles={customSelectStyles}
                            noOptionsMessage={() => "Tidak ada data status"}
                        />
                    </div>
                </div>

                <div className="h-px bg-white/10 my-6" />

                {/* Number Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Total Harga Jual (Rp)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Modal Produk + Packing (Rp)</label>
                        <div className="relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                value={cost} // Renamed variable from input description
                                onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Affiliate Cross-Sell */}
                <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-orange-200 font-medium">Mau margin lebih besar?</p>
                        <p className="text-xs text-gray-400 mb-2">Kurangi biaya packing dengan supplier tangan pertama.</p>
                        <a
                            href="#" // Replace with real affiliate link later
                            target="_blank"
                            className="text-xs inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 underline font-medium"
                        >
                            Beli Plastik & Bubble Wrap Hemat <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </motion.div>

            {/* Results Section */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
            >
                {/* Scorecards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 border-l-4 border-indigo-500">
                        <p className="text-xs text-gray-400 mb-1">Biaya Admin Total</p>
                        <h3 className="text-lg font-bold text-white">
                            Rp {result.totalDeduction.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                        </h3>
                        <p className="text-xs text-indigo-400 mt-1">
                            ~{((result.totalDeduction / (Number(price) || 1)) * 100).toFixed(1)}% dari harga
                        </p>
                    </div>

                    <div className={`glass-card p-4 border-l-4 ${result.netProfit >= 0 ? 'border-emerald-500' : 'border-red-500'}`}>
                        <p className="text-xs text-gray-400 mb-1">Profit Bersih</p>
                        <h3 className={`text-lg font-bold ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            Rp {result.netProfit.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                        </h3>
                        <p className={`text-xs mt-1 ${result.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            Margin: {result.margin.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="glass-card p-6 min-h-[300px] flex flex-col items-center justify-center">
                    {(!selectedTier || !price) ? (
                        <div className="text-center text-gray-500">
                            <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Masukkan data untuk melihat grafik</p>
                        </div>
                    ) : (
                        <div className="w-full h-[300px]">
                            <h3 className="text-center text-gray-300 text-sm mb-2">Breakdown Alokasi Dana</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell key="cell-0" fill="#F59E0B" /> {/* Modal */}
                                        <Cell key="cell-1" fill="#10B981" /> {/* Profit */}
                                        <Cell key="cell-2" fill="#6366F1" /> {/* Admin */}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Fees Detail */}
                {selectedTier && (
                    <div className="glass-card p-4 space-y-2 text-sm">
                        <h4 className="font-semibold text-white mb-3">Rincian Potongan {selectedPlatform.label}</h4>
                        <div className="flex justify-between text-gray-300">
                            <span>Biaya Admin ({selectedTier.data.adminFee}%)</span>
                            <span>Rp {result.adminFee.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                            <span>Biaya Layanan/Payment ({selectedTier.data.paymentFee}%)</span>
                            <span>Rp {result.paymentFee.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                            <span>Biaya Gratis Ongkir ({selectedTier.data.freeShippingFee || 0}%)</span>
                            <span>Rp {result.freeShippingFee.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between text-white font-bold">
                            <span>Total Diterima Seller</span>
                            <span>Rp {result.netPayout.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                )}

            </motion.div>
        </div>
    )
}
