import { getTermBySlug, terms } from '@/lib/dictionary'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Lightbulb, Truck } from 'lucide-react'
import { Metadata } from 'next'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateStaticParams() {
    return terms.map(term => ({
        slug: term.slug
    }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const term = getTermBySlug(slug)

    if (!term) return { title: 'Istilah Tidak Ditemukan' }

    return {
        title: `Arti Status "${term.term}" di Pengiriman - Kamus Logistik`,
        description: `Apa arti ${term.term}? Definisi: ${term.definition}. Cari tahu solusi jika paket Anda statusnya ${term.term}.`,
    }
}

export default async function TermPage({ params }: PageProps) {
    const { slug } = await params
    const term = getTermBySlug(slug)

    if (!term) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-slate-950 py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/kamus"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Kamus
                </Link>

                <article className="glass-card p-8 md:p-12">
                    <header className="mb-8 border-b border-white/10 pb-8">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2 font-medium">
                            <BookOpen className="w-5 h-5" />
                            <span>Kamus Istilah Pengiriman</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            {term.term}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30">
                                {term.courier}
                            </span>
                        </div>
                    </header>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-3">Apa Artinya?</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {term.definition}
                            </p>
                        </section>

                        <section className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-yellow-200 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                Solusi / Yang Harus Dilakukan
                            </h2>
                            <p className="text-yellow-100/80">
                                {term.solution}
                            </p>
                        </section>

                        {term.related_terms && term.related_terms.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Istilah Terkait</h3>
                                <div className="flex flex-wrap gap-2">
                                    {term.related_terms.map(rel => (
                                        <div key={rel} className="px-3 py-1 bg-white/5 rounded-lg text-gray-400 text-sm">
                                            {rel}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </article>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 mb-4">Masih bingung dengan status paketmu?</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium"
                    >
                        <Truck className="w-5 h-5" />
                        Cek Resi Sekarang
                    </Link>
                </div>
            </div>
        </main>
    )
}
