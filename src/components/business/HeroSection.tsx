import Link from 'next/link';
import { ArrowRight, Code, Zap } from 'lucide-react';

export default function HeroSection() {
    return (
        <div className="relative overflow-hidden bg-slate-900 pt-16 pb-32 text-white">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-blue-900/50 border border-blue-500/30 rounded-full px-3 py-1 mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                            <span className="text-sm font-medium text-blue-200">v1.0 Public API Release</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Infrastruktur Logistik <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                Enterprise Grade
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 mb-8 max-w-lg">
                            Integrasikan Cek Ongkir, Real-time Tracking, dan AI Prediction ke dalam aplikasi Anda hanya dalam 5 menit.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/console" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-all">
                                Dapatkan API Key Gratis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link href="/docs" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white border border-slate-700 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-all">
                                <Code className="mr-2 h-5 w-5" />
                                Baca Dokumentasi
                            </Link>
                        </div>

                        <div className="mt-8 flex items-center space-x-4 text-sm text-slate-500">
                            <div className="flex items-center"><Zap className="h-4 w-4 mr-1 text-yellow-500" /> 99.9% Uptime</div>
                            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                            <div>15+ Ekspedisi</div>
                            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                            <div>AI Powered</div>
                        </div>
                    </div>

                    {/* Code Preview Simulation */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl blur opacity-30"></div>
                        <div className="relative bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                            <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="ml-4 text-xs text-slate-400 font-mono">bash — curl request</div>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <pre className="font-mono text-sm text-blue-300">
                                    <span className="text-purple-400">curl</span> -X POST https://api.cekkirim.com/v1/cost \<br />
                                    &nbsp;&nbsp;-H <span className="text-green-400">"Authorization: Bearer ck_live_..."</span> \<br />
                                    &nbsp;&nbsp;-d <span className="text-orange-300">'{'{'}
                                        &nbsp;&nbsp;&nbsp;&nbsp;"origin": "CGK",<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;"destination": "BDO",<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;"weight": 1000<br />
                                        &nbsp;&nbsp;{'}'}'</span>
                                </pre>
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-xs text-slate-500 mb-2">// Response (25ms)</p>
                                    <pre className="font-mono text-sm text-emerald-400">
                                        {`{
  "status": "success",
  "data": [
    { "code": "JNE", "service": "REG", "cost": 10000, "etd": "1-2 Days" },
    { "code": "SICEPAT", "service": "GOKIL", "cost": 9000, "etd": "2-3 Days" }
  ]
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
