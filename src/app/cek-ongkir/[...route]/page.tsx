import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { checkOngkir } from '@/app/actions/logistics'
import { slugToDisplayName, getRouteBySlug, popularRoutes } from '@/data/popular-routes'
import { OngkirComparisonTable } from '@/components/logistics/OngkirComparisonTable'
import { ArrowRight, MapPin, Package, TrendingDown, Clock } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'

// Force dynamic rendering to avoid cookies warning at build time
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        route: string[]
    }>
}

// Parse route slug like "jakarta-selatan-ke-bandung"
function parseRouteSlug(routeParts: string[]): { origin: string; destination: string } | null {
    // Join parts and split by 'ke'
    const fullRoute = routeParts.join('/')
    const parts = fullRoute.split('-ke-')

    if (parts.length !== 2) return null

    return {
        origin: parts[0],
        destination: parts[1],
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params
    const parsed = parseRouteSlug(resolvedParams.route)

    if (!parsed) {
        return {
            title: 'Cek Ongkir - CekKirim',
        }
    }

    const originName = slugToDisplayName(parsed.origin)
    const destinationName = slugToDisplayName(parsed.destination)
    const currentYear = new Date().getFullYear()

    const title = `Ongkir Termurah ${originName} ke ${destinationName} - Update ${currentYear}`
    const description = `Cek ongkos kirim dari ${originName} ke ${destinationName}. Bandingkan harga JNE, J&T, SiCepat, AnterAja & kurir lainnya. Gratis & akurat!`

    return {
        title,
        description,
        keywords: [
            `ongkir ${originName.toLowerCase()} ke ${destinationName.toLowerCase()}`,
            `tarif pengiriman ${originName.toLowerCase()}`,
            `biaya kirim ${originName.toLowerCase()} ${destinationName.toLowerCase()}`,
            'cek ongkir',
            'ongkos kirim',
            'JNE', 'J&T', 'SiCepat',
        ],
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://www.cekkirim.com/cek-ongkir/${resolvedParams.route.join('/')}`,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: `https://www.cekkirim.com/cek-ongkir/${resolvedParams.route.join('/')}`,
        },
    }
}

// Generate Static Params for Popular Routes
export async function generateStaticParams() {
    return popularRoutes.map((route) => ({
        route: [route.originSlug + '-ke-' + route.destinationSlug],
    }))
}

export default async function OngkirRoutePage({ params }: PageProps) {
    const resolvedParams = await params
    const parsed = parseRouteSlug(resolvedParams.route)

    if (!parsed) {
        notFound()
    }

    const originName = slugToDisplayName(parsed.origin)
    const destinationName = slugToDisplayName(parsed.destination)
    const currentYear = new Date().getFullYear()

    // Try to find route in popular routes to get IDs
    const knownRoute = getRouteBySlug(parsed.origin, parsed.destination)

    // Fetch ongkir data
    let ongkirResult = null
    if (knownRoute) {
        ongkirResult = await checkOngkir({
            originId: knownRoute.originId,
            destinationId: knownRoute.destinationId,
            weight: 1000, // Default 1kg
        })
    }

    // Get related routes for internal linking
    const relatedRoutes = popularRoutes
        .filter(r => r.originSlug === parsed.origin || r.destinationSlug === parsed.destination)
        .filter(r => !(r.originSlug === parsed.origin && r.destinationSlug === parsed.destination))
        .slice(0, 6)

    // Schema.org Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `Ongkir ${originName} ke ${destinationName}`,
        description: `Cek ongkos kirim termurah dari ${originName} ke ${destinationName}.`,
        offers: {
            '@type': 'AggregateOffer',
            lowPrice: ongkirResult?.data?.[0]?.price || 0,
            priceCurrency: 'IDR',
            offerCount: ongkirResult?.data?.length || 0
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20 px-4">
            <JsonLd data={jsonLd} />
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                    <ol className="flex items-center gap-2 text-gray-400">
                        <li><Link href="/" className="hover:text-white">Beranda</Link></li>
                        <li>/</li>
                        <li><Link href="/#ongkir" className="hover:text-white">Cek Ongkir</Link></li>
                        <li>/</li>
                        <li className="text-white">{originName} ke {destinationName}</li>
                    </ol>
                </nav>

                {/* Hero Section */}
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        Ongkir Termurah dari{' '}
                        <span className="gradient-text">{originName}</span> ke{' '}
                        <span className="gradient-text">{destinationName}</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-6">
                        Update {currentYear} - Bandingkan harga pengiriman dari semua ekspedisi Indonesia
                    </p>

                    {/* Route Badge */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                            <MapPin className="w-5 h-5 text-indigo-400" />
                            <span className="text-white font-medium">{originName}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                            <MapPin className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-medium">{destinationName}</span>
                        </div>
                    </div>
                </header>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Harga Termurah</p>
                            <p className="text-gray-400 text-sm">Bandingkan semua kurir</p>
                        </div>
                    </div>
                    <div className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-white font-medium">10+ Ekspedisi</p>
                            <p className="text-gray-400 text-sm">JNE, J&T, SiCepat, dll</p>
                        </div>
                    </div>
                    <div className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Update Real-time</p>
                            <p className="text-gray-400 text-sm">Data selalu akurat</p>
                        </div>
                    </div>
                </div>

                {/* Ongkir Results Table */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        💰 Tabel Perbandingan Ongkir Lengkap
                    </h2>

                    {ongkirResult?.success && ongkirResult.data ? (
                        <OngkirComparisonTable
                            data={ongkirResult.data}
                            origin={originName}
                            destination={destinationName}
                        />
                    ) : (
                        <div className="glass-card p-8 text-center">
                            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">
                                Rute ini belum tersedia dalam database kami.
                            </p>
                            <Link
                                href="/"
                                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                            >
                                Cek Manual di Homepage
                            </Link>
                        </div>
                    )}
                </section>

                {/* SEO Content */}
                <article className="glass-card p-8 mb-12 prose prose-invert max-w-none">
                    <h2>Tentang Pengiriman {originName} ke {destinationName}</h2>
                    <p>
                        Mencari ongkos kirim termurah dari <strong>{originName}</strong> ke <strong>{destinationName}</strong>?
                        CekKirim membantu Anda membandingkan tarif pengiriman dari berbagai ekspedisi seperti JNE, J&T Express,
                        SiCepat, AnterAja, Ninja Xpress, dan lainnya.
                    </p>
                    <p>
                        Harga ongkir di atas dihitung berdasarkan berat 1 kg. Untuk paket yang lebih berat,
                        Anda dapat menggunakan <Link href="/" className="text-indigo-400 hover:text-indigo-300">kalkulator ongkir</Link> di
                        homepage kami.
                    </p>

                    <h3>Tips Hemat Ongkir</h3>
                    <ul>
                        <li>Pilih layanan reguler jika tidak terburu-buru</li>
                        <li>Bandingkan harga antar ekspedisi</li>
                        <li>Manfaatkan promo gratis ongkir dari marketplace</li>
                        <li>Kemas paket dengan efisien untuk mengurangi berat volumetrik</li>
                    </ul>
                </article>

                {/* Related Routes (Internal Linking) */}
                {relatedRoutes.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            🔗 Rute Terkait Lainnya
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {relatedRoutes.map((route, index) => (
                                <Link
                                    key={index}
                                    href={`/cek-ongkir/${route.originSlug}-ke-${route.destinationSlug}`}
                                    className="glass-card p-4 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex items-center gap-2 text-white group-hover:text-indigo-400">
                                        <span>{route.origin}</span>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                        <span>{route.destination}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Lihat tarif ongkir →
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="glass-card p-8 text-center bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Cek Ongkir Rute Lainnya?
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Gunakan kalkulator ongkir kami untuk cek tarif pengiriman ke seluruh Indonesia
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all"
                    >
                        <Package className="w-5 h-5" />
                        Buka Kalkulator Ongkir
                    </Link>
                </section>
            </div>
        </main>
    )
}
