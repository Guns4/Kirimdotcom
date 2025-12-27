'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, CheckCircle2, MessageCircle, Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { captionTemplates, type CaptionTemplate } from '@/data/caption-templates'

type Category = CaptionTemplate['category']
const CATEGORIES: Category[] = ['Soft Selling', 'Hard Selling', 'Discount', 'Follow Up']

export function CaptionGenerator() {
    // Form State
    const [formData, setFormData] = useState({
        customerName: '',
        productName: '',
        discount: '',
        deadline: '',
    })

    // UI State
    const [activeCategory, setActiveCategory] = useState<Category>('Soft Selling')
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
    const [copied, setCopied] = useState(false)

    // Filter templates by category
    const filteredTemplates = useMemo(() =>
        captionTemplates.filter(t => t.category === activeCategory),
        [activeCategory])

    // Set default selection when category changes
    useMemo(() => {
        if (filteredTemplates.length > 0) {
            setSelectedTemplateId(filteredTemplates[0].id)
        }
    }, [filteredTemplates])

    const selectedTemplate = useMemo(() =>
        captionTemplates.find(t => t.id === selectedTemplateId),
        [selectedTemplateId])

    // Generate output
    const generatedText = useMemo(() => {
        if (!selectedTemplate) return ''
        let text = selectedTemplate.content
        text = text.replace(/{customerName}/g, formData.customerName || '[Nama Pembeli]')
        text = text.replace(/{productName}/g, formData.productName || '[Nama Produk]')
        text = text.replace(/{discount}/g, formData.discount || '[Diskon]')
        text = text.replace(/{deadline}/g, formData.deadline || '[Hari/Tanggal]')
        return text
    }, [selectedTemplate, formData])

    // Handlers
    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText)
        setCopied(true)
        toast.success('Teks berhasil disalin!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShareWA = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(generatedText)}`
        window.open(url, '_blank')
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Inputs */}
            <div className="space-y-6">
                <div className="glass-card p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">1. Isi Data Penjualan</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nama Pembeli / Sapaan</label>
                            <input
                                type="text"
                                placeholder="Contoh: Budi, Kakak, Sist"
                                value={formData.customerName}
                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nama Produk</label>
                            <input
                                type="text"
                                placeholder="Contoh: Sepatu Lari, Paket Glowing"
                                value={formData.productName}
                                onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Diskon (%)</label>
                                <input
                                    type="text"
                                    placeholder="50"
                                    value={formData.discount}
                                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Deadline Promo</label>
                                <input
                                    type="text"
                                    placeholder="Minggu, Besok"
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={() => setFormData({ customerName: '', productName: '', discount: '', deadline: '' })}
                                className="text-sm text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Reset Form
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Template & Preview */}
            <div className="space-y-6">
                {/* Category Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Templates List (Horizontal Scroll or Grid) */}
                <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTemplateId(t.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${selectedTemplateId === t.id
                                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                                }`}
                        >
                            <span className="text-sm font-semibold">{t.label}</span>
                        </button>
                    ))}
                </div>

                {/* Live Preview Card */}
                <motion.div
                    layout
                    className="glass-card p-6 md:p-8 bg-gradient-to-br from-gray-900 to-black border-indigo-500/20 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MessageCircle className="w-24 h-24 text-white" />
                    </div>

                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Preview Hasil</h3>

                    <div className="bg-white/5 rounded-xl p-4 min-h-[160px] text-white whitespace-pre-line leading-relaxed font-sans text-lg border border-white/5">
                        {generatedText}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleCopy}
                            className="flex-1 bg-white hover:bg-gray-100 text-gray-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            {copied ? 'Tersalin!' : 'Copy Teks'}
                        </button>
                        <button
                            onClick={handleShareWA}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Kirim WA
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
