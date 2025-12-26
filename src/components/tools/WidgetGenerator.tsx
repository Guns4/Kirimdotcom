'use client'

import { useState } from 'react'
import { Copy, Check, Code, Palette, Laptop } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner' // Assuming sonner is used, or alert

export function WidgetGenerator() {
    const [color, setColor] = useState('blue')
    const [copied, setCopied] = useState(false)

    const colors = [
        { id: 'blue', label: 'Biru', class: 'bg-blue-600' },
        { id: 'purple', label: 'Ungu', class: 'bg-purple-600' },
        { id: 'green', label: 'Hijau', class: 'bg-green-600' },
        { id: 'red', label: 'Merah', class: 'bg-red-600' },
        { id: 'orange', label: 'Jingga', class: 'bg-orange-500' }
    ]

    const widgetUrl = `https://www.cekkirim.com/widget/search?color=${color}`
    const embedCode = `<iframe 
  src="${widgetUrl}" 
  width="100%" 
  height="200" 
  frameborder="0" 
  style="border:none; overflow:hidden;" 
  allowtransparency="true">
</iframe>`

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-4 text-white">
                            <Palette className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-semibold">Kustomisasi Widget</h3>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm text-gray-400 block">Pilih Warna Aksen</label>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setColor(c.id)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${c.class} ${color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                        aria-label={c.label}
                                    >
                                        {color === c.id && <Check className="w-5 h-5 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4 text-white">
                            <div className="flex items-center gap-2">
                                <Code className="w-5 h-5 text-indigo-400" />
                                <h3 className="font-semibold">Kode Embed</h3>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 text-indigo-300"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Disalin!' : 'Salin Kode'}
                            </button>
                        </div>

                        <div className="relative group">
                            <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-sm text-gray-300 font-mono border border-white/5">
                                {embedCode}
                            </pre>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Salin kode di atas dan tempelkan di halaman website atau blog Anda (WordPress, Blogger, dll).
                        </p>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-white px-2">
                        <Laptop className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-semibold">Live Preview</h3>
                    </div>

                    <div className="glass-card p-8 bg-black/20 relative overflow-hidden flex items-center justify-center min-h-[300px]">
                        {/* Mock Website Background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                        />

                        <div className="w-full relative z-10">
                            <iframe
                                src={`/widget/search?color=${color}`}
                                width="100%"
                                height="200"
                                className="border-0 bg-transparent"
                                title="CekKirim Widget Preview"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                        <span className="text-xl">💡</span>
                        <p>
                            Widget ini responsif dan background transparan, sehingga akan menyatu sempurna dengan desain website Anda.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
