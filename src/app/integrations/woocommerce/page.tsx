'use client';

import { Download, Check, Shield, Zap, Box } from 'lucide-react';
import Link from 'next/link';

export default function WooCommercePluginPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white pt-24 pb-20 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 bg-purple-800/50 px-4 py-1.5 rounded-full border border-purple-400/30 text-sm font-medium">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            v1.0.0 Stable Release
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            Shipping Automation for <span className="text-purple-300">WooCommerce</span>
                        </h1>
                        <p className="text-xl text-purple-100/90 leading-relaxed">
                            Integrate CekKirim's powerful logistics engine directly into your WordPress store.
                            Real-time rates, auto-markup, and cashless shipping in one plugin.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <a
                                href="/downloads/cekkirim-shipping.zip"
                                className="bg-white text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                <Download size={20} /> Download Plugin
                            </a>
                            <Link
                                href="/docs/woocommerce-guide"
                                className="bg-purple-800/50 border border-purple-400/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-800/70 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                Read Documentation
                            </Link>
                        </div>
                        <p className="text-sm text-purple-200/60">
                            Requires WordPress 6.0+ and WooCommerce 8.0+
                        </p>
                    </div>

                    {/* Hero Image / Illustration */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                        <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <span className="font-mono text-sm text-purple-200">WooCommerce Settings</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-black/20 p-3 rounded border border-white/5">
                                        <div className="text-xs text-gray-400 mb-1">Method Title</div>
                                        <div className="text-sm font-medium">CekKirim Logistics</div>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded border border-white/5">
                                        <div className="text-xs text-gray-400 mb-1">API Key</div>
                                        <div className="text-sm font-mono text-green-300">ck_live_8f92k...</div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="bg-black/20 p-3 rounded border border-white/5 flex-1">
                                            <div className="text-xs text-gray-400 mb-1">Markup (Rp)</div>
                                            <div className="text-sm">1000</div>
                                        </div>
                                        <div className="bg-black/20 p-3 rounded border border-white/5 flex-1">
                                            <div className="text-xs text-gray-400 mb-1">Enable Cache</div>
                                            <div className="text-sm text-green-300">Active</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-6xl mx-auto py-20 px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap className="text-yellow-500" />}
                        title="Real-time Rates"
                        desc="Fetch accurate shipping rates from 10+ couriers (JNE, SiCepat, J&T) instantly during checkout."
                    />
                    <FeatureCard
                        icon={<Shield className="text-blue-500" />}
                        title="Secure & Reliable"
                        desc="Enterprise-grade security with API Key authentication and 99.9% uptime SLA."
                    />
                    <FeatureCard
                        icon={<Box className="text-purple-500" />}
                        title="Profit Markup"
                        desc="Automatically add a hidden margin to shipping costs to cover packaging or increase revenue."
                    />
                </div>
            </div>

            {/* Installation Guide */}
            <div className="bg-white border-y border-gray-200 py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Installation Guide</h2>

                    <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-8 md:before:left-[17px] before:w-0.5 before:bg-gray-200">
                        <Step
                            num="1"
                            title="Download & Upload"
                            desc="Download the .zip file and upload it via WordPress Admin > Plugins > Add New > Upload Plugin."
                        />
                        <Step
                            num="2"
                            title="Activate & Configure"
                            desc="Activate the plugin. Go to WooCommerce > Settings > Shipping > CekKirim to enter your API Key."
                        />
                        <Step
                            num="3"
                            title="Set Your Markup"
                            desc="(Optional) Configure a price markup to earn extra profit from every shipment."
                        />
                        <Step
                            num="4"
                            title="Ready to Ship!"
                            desc="Customers will now see real-time shipping rates at checkout. Labels can be generated from your Dashboard."
                        />
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="text-center py-20 px-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to optimize your shipping?</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Join 5,000+ merchants using CekKirim to streamline their logistics and increase profit margins.
                </p>
                <a
                    href="/downloads/cekkirim-shipping.zip"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md"
                >
                    <Download size={20} /> Download Plugin Now
                </a>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 text-2xl">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
    return (
        <div className="relative pl-20 md:pl-16">
            <div className="absolute left-2 md:left-0 top-0 w-12 h-9 md:w-9 md:h-9 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold z-10 border-4 border-white shadow-sm">
                {num}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 border-l-4 border-purple-100 pl-4 py-1">{desc}</p>
            </div>
        </div>
    );
}
