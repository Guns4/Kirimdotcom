import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost, getRelatedPosts, generateArticleSchema, getAllBlogPosts } from '@/lib/blog'
import { Calendar, User, Clock, ArrowLeft, Tag, Package, Search } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'

interface BlogPostPageProps {
    params: Promise<{ slug: string }>
}

// Generate static paths
export async function generateStaticParams() {
    const posts = await getAllBlogPosts()
    return posts.map((post) => ({ slug: post.slug }))
}

// Generate metadata
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await getBlogPost(slug)

    if (!post) return { title: 'Not Found' }

    return {
        title: `${post.title} | Blog CekKirim`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
        },
    }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params
    const post = await getBlogPost(slug)

    if (!post) {
        notFound()
    }

    const relatedPosts = await getRelatedPosts(slug, post.tags, 3)
    const articleSchema = generateArticleSchema(post, `https://www.cekkirim.com/blog/${slug}`)

    return (
        <>
            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Blog
                        </Link>
                    </nav>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <article className="lg:col-span-2">
                            {/* Header */}
                            <header className="mb-8">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600/20 text-indigo-400 text-sm rounded-full"
                                        >
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    {post.title}
                                </h1>

                                <p className="text-lg text-gray-400 mb-6">
                                    {post.description}
                                </p>

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-white/10 pb-6">
                                    <span className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {post.author}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(post.date).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {post.readingTime}
                                    </span>
                                </div>
                            </header>

                            {/* Article Content */}
                            <div className="prose prose-invert prose-indigo max-w-none 
                prose-headings:font-semibold prose-headings:text-white
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-ul:text-gray-300 prose-ol:text-gray-300
                prose-li:marker:text-indigo-400
                prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-600/10 prose-blockquote:p-4 prose-blockquote:rounded-r-lg
                prose-code:text-indigo-300 prose-code:bg-white/10 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                prose-table:text-gray-300
                prose-th:text-white prose-th:bg-white/10
                prose-td:border-white/10
              ">
                                <MDXRemote source={post.content} />
                            </div>

                            {/* Share & Actions */}
                            <div className="mt-12 pt-8 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-400">Artikel ini bermanfaat? Share ke teman Anda!</p>
                                    <div className="flex gap-2">
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://www.cekkirim.com/blog/${slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
                                        >
                                            Twitter
                                        </a>
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(post.title + ' - https://www.cekkirim.com/blog/' + slug)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                                        >
                                            WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Sidebar */}
                        <aside className="lg:col-span-1 space-y-6">
                            {/* Mini Tracking Widget */}
                            <div className="glass-card p-6 sticky top-24">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-indigo-400" />
                                    Cek Resi Sekarang
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Lacak paket Anda secara real-time
                                </p>
                                <form action="/" method="GET" className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            name="resi"
                                            placeholder="Nomor resi..."
                                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-indigo-700 hover:to-purple-700"
                                    >
                                        Lacak Paket
                                    </button>
                                </form>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <Link
                                        href="/bulk-tracking"
                                        className="block text-center text-indigo-400 text-sm hover:underline"
                                    >
                                        Cek Resi Massal untuk Seller →
                                    </Link>
                                </div>
                            </div>

                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">
                                        Artikel Terkait
                                    </h3>
                                    <div className="space-y-4">
                                        {relatedPosts.map((related) => (
                                            <Link
                                                key={related.slug}
                                                href={`/blog/${related.slug}`}
                                                className="block group"
                                            >
                                                <h4 className="text-sm text-gray-300 group-hover:text-indigo-400 transition-colors line-clamp-2">
                                                    {related.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {related.readingTime}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="glass-card p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    🚀 Cek Ongkir Gratis!
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Bandingkan harga 10+ kurir dalam satu klik
                                </p>
                                <Link
                                    href="/"
                                    className="block w-full py-3 bg-white text-slate-900 rounded-lg font-medium text-sm text-center hover:bg-gray-100"
                                >
                                    Cek Sekarang
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </>
    )
}
