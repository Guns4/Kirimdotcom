import { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/blog'
import { Calendar, User, Clock, ArrowRight, Newspaper } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Blog - Tips Pengiriman & Tracking | CekKirim',
    description: 'Artikel dan tips seputar pengiriman paket, cara tracking resi, perbandingan kurir, dan solusi masalah pengiriman di Indonesia.',
}

export default async function BlogPage() {
    const posts = await getAllBlogPosts()

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full text-indigo-400 text-sm mb-4">
                        <Newspaper className="w-4 h-4" />
                        Blog & Tips
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Tips Pengiriman & Tracking
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Pelajari cara efektif mengirim paket, tracking resi, dan mengatasi masalah pengiriman
                    </p>
                </div>

                {/* Blog Grid */}
                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">Belum ada artikel.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {posts.map((post) => (
                            <article key={post.slug} className="glass-card overflow-hidden group hover:border-indigo-500/50 transition-all">
                                {/* Cover Image */}
                                {post.coverImage && (
                                    <div className="aspect-video bg-gradient-to-br from-indigo-600/20 to-purple-600/20 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Newspaper className="w-12 h-12 text-indigo-400/50" />
                                        </div>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {post.tags.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-indigo-600/20 text-indigo-400 text-xs rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                                        <Link href={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>

                                    {/* Description */}
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {post.description}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(post.date).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.readingTime}
                                        </span>
                                    </div>

                                    {/* Read More */}
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="inline-flex items-center gap-2 text-indigo-400 text-sm hover:gap-3 transition-all"
                                    >
                                        Baca Selengkapnya
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
