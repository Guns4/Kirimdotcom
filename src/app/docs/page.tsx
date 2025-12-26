import { Metadata } from 'next'
import Link from 'next/link'
import { Code, Key, Zap, Shield, ArrowRight, Copy, ExternalLink, Package, Truck, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'API Documentation - CekKirim',
    description: 'Dokumentasi lengkap CekKirim API untuk integrasi tracking paket dan cek ongkir',
}

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
            {/* Hero */}
            <section className="pt-20 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full text-indigo-400 text-sm mb-6">
                        <Code className="w-4 h-4" />
                        API Documentation v1
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        CekKirim API
                    </h1>
                    <p className="text-xl text-gray-400 mb-8">
                        Integrasikan tracking paket dan cek ongkir ke aplikasi Anda
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/dashboard#api"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium"
                        >
                            <Key className="w-5 h-5" />
                            Dapatkan API Key
                        </Link>
                        <a
                            href="#quickstart"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20"
                        >
                            Quick Start
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 px-4 border-t border-white/10">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white/5 rounded-xl">
                        <Zap className="w-10 h-10 text-yellow-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Fast Response</h3>
                        <p className="text-gray-400 text-sm">Response time &lt;200ms dengan caching cerdas</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl">
                        <Truck className="w-10 h-10 text-green-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">10+ Kurir</h3>
                        <p className="text-gray-400 text-sm">JNE, JNT, SiCepat, AnterAja, Pos Indonesia, dan lainnya</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-xl">
                        <Shield className="w-10 h-10 text-blue-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
                        <p className="text-gray-400 text-sm">API key terenkripsi, rate limiting, dan HTTPS</p>
                    </div>
                </div>
            </section>

            {/* Quick Start */}
            <section id="quickstart" className="py-16 px-4 border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Quick Start</h2>

                    <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium mb-2">Dapatkan API Key</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Login ke dashboard dan generate API key di menu "Developer API"
                                </p>
                                <Link href="/dashboard" className="text-indigo-400 text-sm hover:underline">
                                    Buka Dashboard →
                                </Link>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium mb-2">Buat Request</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Gunakan API key di header <code className="bg-white/10 px-2 py-0.5 rounded">x-api-key</code>
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium mb-2">Terima Response</h3>
                                <p className="text-gray-400 text-sm">
                                    Data tracking dalam format JSON siap diproses
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Endpoints */}
            <section className="py-16 px-4 border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Endpoints</h2>

                    {/* Track Endpoint */}
                    <div className="glass-card mb-8 overflow-hidden">
                        <div className="p-4 bg-green-600/20 border-b border-white/10 flex items-center gap-3">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">GET</span>
                            <code className="text-white font-mono">/api/v1/track</code>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-400 mb-6">Lacak status paket berdasarkan nomor resi</p>

                            {/* Parameters */}
                            <h4 className="text-white font-medium mb-3">Query Parameters</h4>
                            <table className="w-full mb-6">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500 border-b border-white/10">
                                        <th className="py-2">Parameter</th>
                                        <th className="py-2">Type</th>
                                        <th className="py-2">Required</th>
                                        <th className="py-2">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3"><code className="text-indigo-400">awb</code></td>
                                        <td className="text-gray-400">string</td>
                                        <td><span className="text-green-400">Yes</span></td>
                                        <td className="text-gray-400">Nomor resi/AWB</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3"><code className="text-indigo-400">courier</code></td>
                                        <td className="text-gray-400">string</td>
                                        <td><span className="text-green-400">Yes</span></td>
                                        <td className="text-gray-400">Kode kurir (jne, jnt, sicepat, anteraja, pos, ninja, lion, tiki, wahana, sap)</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Headers */}
                            <h4 className="text-white font-medium mb-3">Headers</h4>
                            <table className="w-full mb-6">
                                <tbody className="text-sm">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3"><code className="text-indigo-400">x-api-key</code></td>
                                        <td className="text-gray-400">string</td>
                                        <td><span className="text-green-400">Yes</span></td>
                                        <td className="text-gray-400">API key Anda</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Example Request */}
                            <h4 className="text-white font-medium mb-3">Example Request</h4>

                            {/* cURL */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span className="px-2 py-1 bg-white/10 rounded">cURL</span>
                                </div>
                                <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code className="text-green-400">{`curl -X GET "https://www.cekkirim.com/api/v1/track?awb=CGK1234567890&courier=jne" \\
  -H "x-api-key: ck_live_your_api_key_here"`}</code>
                                </pre>
                            </div>

                            {/* JavaScript */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span className="px-2 py-1 bg-white/10 rounded">JavaScript</span>
                                </div>
                                <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code className="text-blue-400">{`const response = await fetch(
  'https://www.cekkirim.com/api/v1/track?awb=CGK1234567890&courier=jne',
  {
    headers: {
      'x-api-key': 'ck_live_your_api_key_here'
    }
  }
);

const data = await response.json();
console.log(data);`}</code>
                                </pre>
                            </div>

                            {/* Python */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span className="px-2 py-1 bg-white/10 rounded">Python</span>
                                </div>
                                <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code className="text-yellow-400">{`import requests

response = requests.get(
    'https://www.cekkirim.com/api/v1/track',
    params={'awb': 'CGK1234567890', 'courier': 'jne'},
    headers={'x-api-key': 'ck_live_your_api_key_here'}
)

data = response.json()
print(data)`}</code>
                                </pre>
                            </div>

                            {/* Example Response */}
                            <h4 className="text-white font-medium mb-3">Example Response</h4>
                            <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-sm">
                                <code className="text-gray-300">{`{
  "success": true,
  "data": {
    "awb": "CGK1234567890",
    "courier": "jne",
    "status": "DELIVERED",
    "description": "Paket telah diterima oleh BUDI",
    "shipper": "TOKO ONLINE",
    "receiver": "JOHN DOE",
    "origin": "JAKARTA",
    "destination": "BANDUNG",
    "history": [
      {
        "date": "2024-12-26 14:30",
        "desc": "Paket diterima oleh BUDI",
        "location": "BANDUNG"
      },
      {
        "date": "2024-12-26 08:00",
        "desc": "Paket dalam pengiriman",
        "location": "BANDUNG"
      }
    ]
  },
  "meta": {
    "cached": false,
    "remaining_quota": 998,
    "response_time_ms": 156
  }
}`}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* Error Codes */}
            <section className="py-16 px-4 border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Error Codes</h2>

                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500 border-b border-white/10">
                                <th className="py-3">HTTP Status</th>
                                <th className="py-3">Error Code</th>
                                <th className="py-3">Description</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-white/5">
                                <td className="py-3"><span className="text-yellow-400">400</span></td>
                                <td className="py-3"><code className="text-red-400">MISSING_AWB</code></td>
                                <td className="text-gray-400">Nomor resi tidak disertakan</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3"><span className="text-yellow-400">400</span></td>
                                <td className="py-3"><code className="text-red-400">MISSING_COURIER</code></td>
                                <td className="text-gray-400">Kode kurir tidak disertakan</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3"><span className="text-red-400">401</span></td>
                                <td className="py-3"><code className="text-red-400">MISSING_API_KEY</code></td>
                                <td className="text-gray-400">Header x-api-key tidak ada</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3"><span className="text-red-400">401</span></td>
                                <td className="py-3"><code className="text-red-400">INVALID_API_KEY</code></td>
                                <td className="text-gray-400">API key tidak valid atau sudah direvoke</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3"><span className="text-orange-400">404</span></td>
                                <td className="py-3"><code className="text-red-400">TRACKING_NOT_FOUND</code></td>
                                <td className="text-gray-400">Data tracking tidak ditemukan</td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="py-3"><span className="text-red-400">429</span></td>
                                <td className="py-3"><code className="text-red-400">QUOTA_EXCEEDED</code></td>
                                <td className="text-gray-400">Kuota bulanan habis</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-16 px-4 border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Pricing</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Free</h3>
                            <div className="text-3xl font-bold text-white mb-4">Rp 0<span className="text-sm text-gray-500">/bulan</span></div>
                            <ul className="space-y-2 text-sm text-gray-400 mb-6">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> 1,000 request/bulan</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Track endpoint</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Standard support</li>
                            </ul>
                        </div>
                        <div className="glass-card p-6 border-2 border-indigo-500">
                            <div className="text-indigo-400 text-xs font-bold mb-2">POPULAR</div>
                            <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
                            <div className="text-3xl font-bold text-white mb-4">Rp 99k<span className="text-sm text-gray-500">/bulan</span></div>
                            <ul className="space-y-2 text-sm text-gray-400 mb-6">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> 10,000 request/bulan</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Track + Ongkir endpoint</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Priority support</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Webhook notifications</li>
                            </ul>
                        </div>
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Enterprise</h3>
                            <div className="text-3xl font-bold text-white mb-4">Custom</div>
                            <ul className="space-y-2 text-sm text-gray-400 mb-6">
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Unlimited requests</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Custom integration</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Dedicated support</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> SLA guarantee</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 border-t border-white/10">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Mulai Integrasi Sekarang</h2>
                    <p className="text-gray-400 mb-6">Dapatkan API key gratis dan mulai tracking dalam hitungan menit</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium"
                    >
                        <Key className="w-5 h-5" />
                        Dapatkan API Key Gratis
                    </Link>
                </div>
            </section>
        </div>
    )
}
