import Link from 'next/link';
import { ArrowLeft, Book, Code, Terminal } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Docs Header */}
            <header className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/console" className="text-slate-500 hover:text-slate-900">
                            <ArrowLeft size={20} />
                        </Link>
                        <span className="font-bold text-lg text-slate-900">CekKirim API <span className="text-slate-400 font-normal">Docs</span></span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <a href="#authentication" className="hover:text-blue-600">Authentication</a>
                        <a href="#endpoints" className="hover:text-blue-600">Endpoints</a>
                        <a href="#errors" className="hover:text-blue-600">Errors</a>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12 flex gap-12">
                {/* Sidebar Nav */}
                <aside className="w-64 hidden md:block shrink-0">
                    <nav className="sticky top-24 space-y-1">
                        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Getting Started</p>
                        <a href="#intro" className="block px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">Introduction</a>
                        <a href="#auth" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Authentication</a>

                        <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-8">Resources</p>
                        <a href="#cost" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Check Cost</a>
                        <a href="#track" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Track Package</a>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 max-w-3xl">
                    <section id="intro" className="mb-16">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Introduction</h1>
                        <p className="text-lg text-slate-600 mb-4">
                            CekKirim API memungkinkan Anda mengakses data logistik real-time dari 15+ ekspedisi di Indonesia.
                            API ini didesain menggunakan prinsip RESTful.
                        </p>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-4">
                            <Book className="text-blue-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-900">Base URL</h4>
                                <code className="text-sm text-blue-800">https://api.cekkirim.com/v1</code>
                            </div>
                        </div>
                    </section>

                    <section id="auth" className="mb-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication</h2>
                        <p className="text-slate-600 mb-4">
                            Autentikasi menggunakan API Key yang dikirim via header <code className="bg-slate-100 px-1 rounded">x-api-key</code>.
                        </p>
                        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 text-xs text-slate-400">
                                <Terminal size={14} /> Example Request
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <pre className="text-sm font-mono text-blue-300">
                                    curl -X GET https://api.cekkirim.com/v1/track?awb=JP123456 \<br />
                                    &nbsp;&nbsp;-H <span className="text-green-400">"x-api-key: ck_live_..."</span>
                                </pre>
                            </div>
                        </div>
                    </section>

                    <section id="cost" className="mb-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Check Shipping Cost</h2>
                        <p className="text-slate-600 mb-4">Mendapatkan daftar harga ongkir dari berbagai kurir.</p>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-1 bg-green-100 text-green-700 font-bold rounded text-xs">POST</span>
                            <code className="text-slate-700">/cost</code>
                        </div>

                        <h4 className="font-bold text-slate-900 mb-2">Parameters</h4>
                        <table className="w-full text-sm text-left mb-6 border border-slate-200 rounded-lg overflow-hidden">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 border-b">Field</th>
                                    <th className="p-3 border-b">Type</th>
                                    <th className="p-3 border-b">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border-b font-mono text-blue-600">origin</td>
                                    <td className="p-3 border-b text-slate-500">string</td>
                                    <td className="p-3 border-b">Kode kecamatan asal (ex: "CGK10")</td>
                                </tr>
                                <tr>
                                    <td className="p-3 border-b font-mono text-blue-600">destination</td>
                                    <td className="p-3 border-b text-slate-500">string</td>
                                    <td className="p-3 border-b">Kode kecamatan tujuan (ex: "BDO01")</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono text-blue-600">weight</td>
                                    <td className="p-3 text-slate-500">number</td>
                                    <td className="p-3">Berat dalam gram</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section id="track" className="mb-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Track Package</h2>
                        <p className="text-slate-600 mb-4">Lacak status pengiriman paket berdasarkan nomor resi.</p>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded text-xs">GET</span>
                            <code className="text-slate-700">/track?awb={'{'}{'{'}awb_number{'}'}{'}'}</code>
                        </div>

                        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 text-xs text-slate-400">
                                <Code size={14} /> Response Example
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <pre className="text-sm font-mono text-emerald-400">
                                    {`{
  "status": "success",
  "data": {
    "awb": "JP123456789",
    "courier": "JNE",
    "status": "DELIVERED",
    "history": [
      {
        "date": "2024-01-01 14:30",
        "desc": "Paket telah diterima"
      }
    ]
  }
}`}
                                </pre>
                            </div>
                        </div>
                    </section>

                    <section id="errors" className="mb-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Codes</h2>
                        <div className="space-y-4">
                            <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                                <code className="font-bold text-red-800">403 Forbidden</code>
                                <p className="text-sm text-red-700 mt-1">API key tidak valid atau tidak aktif.</p>
                            </div>
                            <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                                <code className="font-bold text-yellow-800">429 Too Many Requests</code>
                                <p className="text-sm text-yellow-700 mt-1">Kuota API Anda habis. Silakan topup saldo.</p>
                            </div>
                            <div className="border border-slate-200 bg-slate-50 p-4 rounded-lg">
                                <code className="font-bold text-slate-800">500 Internal Server Error</code>
                                <p className="text-sm text-slate-700 mt-1">Terjadi kesalahan pada server. Hubungi support.</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
