'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Copy, Check, Trash2, BarChart3, ExternalLink, Eye, EyeOff, Loader2 } from 'lucide-react'
import { generateApiKey, getApiKeys, revokeApiKey } from '@/app/actions/api-keys'

interface ApiKey {
    id: string
    name: string
    key_prefix: string
    requests_count: number
    requests_limit: number
    is_active: boolean
    last_used_at: string | null
    created_at: string
}

export function DeveloperApiDashboard() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [showNewKey, setShowNewKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        loadApiKeys()
    }, [])

    const loadApiKeys = async () => {
        setLoading(true)
        const keys = await getApiKeys()
        setApiKeys(keys)
        setLoading(false)
    }

    const handleGenerateKey = async () => {
        if (!newKeyName.trim()) return

        setGenerating(true)
        const result = await generateApiKey(newKeyName)
        setGenerating(false)

        if (result.success && result.apiKey) {
            setShowNewKey(result.apiKey)
            setNewKeyName('')
            loadApiKeys()
        }
    }

    const handleRevokeKey = async (keyId: string) => {
        if (!confirm('Yakin ingin menonaktifkan API key ini? Aksi ini tidak dapat dibatalkan.')) {
            return
        }

        await revokeApiKey(keyId)
        loadApiKeys()
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Key className="w-6 h-6 text-indigo-400" />
                        Developer API
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Kelola API key untuk integrasi dengan aplikasi Anda
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Generate Key
                </button>
            </div>

            {/* New Key Alert */}
            {showNewKey && (
                <div className="p-4 bg-green-600/20 border border-green-500/30 rounded-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-green-400 font-medium mb-2">🎉 API Key Berhasil Dibuat!</p>
                            <p className="text-gray-400 text-sm mb-3">
                                Simpan key ini dengan aman. Key hanya ditampilkan sekali!
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="bg-black/30 px-3 py-2 rounded text-green-300 text-sm font-mono">
                                    {showNewKey}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(showNewKey)}
                                    className="p-2 hover:bg-white/10 rounded"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowNewKey(null)}
                            className="text-gray-400 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* API Keys List */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h3 className="text-white font-medium">API Keys Aktif</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                    </div>
                ) : apiKeys.filter(k => k.is_active).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Belum ada API key. Klik "Generate Key" untuk membuat.
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-left text-sm text-gray-400">
                                <th className="py-3 px-4">Nama</th>
                                <th className="py-3 px-4">Key</th>
                                <th className="py-3 px-4">Penggunaan</th>
                                <th className="py-3 px-4 hidden md:table-cell">Terakhir</th>
                                <th className="py-3 px-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiKeys.filter(k => k.is_active).map((key) => (
                                <tr key={key.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 text-white">{key.name}</td>
                                    <td className="py-3 px-4">
                                        <code className="text-gray-400 text-sm">{key.key_prefix}••••••••</code>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-white/10 rounded-full h-2 max-w-[100px]">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full"
                                                    style={{ width: `${(key.requests_count / key.requests_limit) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-gray-400 text-sm">
                                                {key.requests_count}/{key.requests_limit}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell text-gray-500 text-sm">
                                        {key.last_used_at
                                            ? new Date(key.last_used_at).toLocaleDateString('id-ID')
                                            : 'Belum pernah'
                                        }
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => handleRevokeKey(key.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Quick Start */}
            <div className="glass-card p-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Quick Start
                </h3>
                <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="text-green-400">{`curl -X GET "https://www.cekkirim.com/api/v1/track?awb=YOUR_RESI&courier=jne" \\
  -H "x-api-key: YOUR_API_KEY"`}</code>
                </pre>
                <a
                    href="/docs"
                    className="inline-flex items-center gap-2 mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
                >
                    Lihat dokumentasi lengkap <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {/* Generate Key Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4">Generate API Key</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nama Key</label>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="Contoh: Production App"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleGenerateKey}
                                    disabled={generating || !newKeyName.trim()}
                                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {generating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
