'use client';

import { useState, useEffect } from 'react';
import { createDraft, publishArticle, getArticles, deleteArticle } from '@/app/actions/articleActions';
import { Sparkles, UploadCloud, Loader2, Trash2, Eye, FileText, Clock, Tag, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Article {
    id: number;
    title: string;
    slug: string;
    content_md: string | null;
    meta_desc: string | null;
    keywords: string[] | null;
    status: string;
    read_time_minutes?: number;
    created_at: string;
}

export default function GeneratorPage() {
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState<number | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    // Load existing articles on mount
    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoadingArticles(true);
        const data = await getArticles();
        setArticles(data);
        setLoadingArticles(false);
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Masukkan topik artikel');
            return;
        }

        setLoading(true);
        try {
            const res = await createDraft(topic, keywords);
            if (res.success && res.data) {
                toast.success('Draft berhasil dibuat!');
                setSelectedArticle(res.data);
                setTopic('');
                setKeywords('');
                await loadArticles();
            } else {
                toast.error(res.error || 'Gagal membuat draft');
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan');
        }
        setLoading(false);
    };

    const handlePublish = async (id: number) => {
        setPublishing(id);
        try {
            const res = await publishArticle(id);
            if (res.success) {
                toast.success('Artikel berhasil dipublish!');
                await loadArticles();
                if (selectedArticle?.id === id) {
                    setSelectedArticle(prev => prev ? { ...prev, status: 'published' } : null);
                }
            } else {
                toast.error(res.error || 'Gagal publish artikel');
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan');
        }
        setPublishing(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus artikel ini?')) return;

        try {
            const res = await deleteArticle(id);
            if (res.success) {
                toast.success('Artikel dihapus');
                if (selectedArticle?.id === id) {
                    setSelectedArticle(null);
                }
                await loadArticles();
            } else {
                toast.error(res.error || 'Gagal hapus artikel');
            }
        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="text-indigo-600" />
                        AI Content Generator
                    </h1>
                    <p className="text-gray-500 mt-1">Generate SEO-optimized articles with AI</p>
                </div>
                <button
                    onClick={loadArticles}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Refresh"
                >
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Panel - Generator Form & Articles List */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Generator Form */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Generate New Article
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Topic / Judul
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g. Tips Packing Kaca Pecah Belah"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Keywords (opsional)
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    value={keywords}
                                    onChange={e => setKeywords(e.target.value)}
                                    placeholder="cek ongkir, packing, bubble wrap"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma</p>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !topic.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Generate Draft
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Articles List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <h2 className="font-semibold text-gray-900">Artikel ({articles.length})</h2>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {loadingArticles ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading...
                                </div>
                            ) : articles.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada artikel</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {articles.map(article => (
                                        <div
                                            key={article.id}
                                            onClick={() => setSelectedArticle(article)}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition ${selectedArticle?.id === article.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {article.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <span className={`px-2 py-0.5 rounded-full ${article.status === 'published'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {article.status}
                                                        </span>
                                                        <span>{formatDate(article.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Article Preview */}
                <div className="lg:col-span-2">
                    {selectedArticle ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Article Header */}
                            <div className="p-6 border-b bg-gray-50">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {selectedArticle.title}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                            <span className={`px-2.5 py-1 rounded-full font-medium ${selectedArticle.status === 'published'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {selectedArticle.status === 'published' ? '✓ Published' : '○ Draft'}
                                            </span>
                                            {selectedArticle.read_time_minutes && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {selectedArticle.read_time_minutes} min read
                                                </span>
                                            )}
                                            <span>{formatDate(selectedArticle.created_at)}</span>
                                        </div>
                                        {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {selectedArticle.keywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedArticle.status === 'draft' && (
                                            <button
                                                onClick={() => handlePublish(selectedArticle.id)}
                                                disabled={publishing === selectedArticle.id}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition"
                                            >
                                                {publishing === selectedArticle.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <UploadCloud className="w-4 h-4" />
                                                )}
                                                Publish
                                            </button>
                                        )}
                                        <button
                                            onClick={() => window.open(`/blog/${selectedArticle.slug}`, '_blank')}
                                            className="p-2 hover:bg-gray-200 rounded-lg transition"
                                            title="Preview"
                                        >
                                            <Eye className="w-5 h-5 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedArticle.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                                {selectedArticle.meta_desc && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs font-medium text-blue-700 mb-1">Meta Description:</p>
                                        <p className="text-sm text-blue-900">{selectedArticle.meta_desc}</p>
                                    </div>
                                )}
                            </div>

                            {/* Article Content */}
                            <div className="p-6 max-h-[600px] overflow-y-auto">
                                <div className="prose prose-sm max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                                        {selectedArticle.content_md}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[600px] flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg font-medium">Pilih artikel untuk preview</p>
                                <p className="text-sm">atau generate artikel baru</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
