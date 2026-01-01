'use client';
import React, { useState } from 'react';
import Link from 'next/link';

// ==========================================
// Business Landing Page
// SaaS Storefront for B2B Customers
// ==========================================

export default function BusinessPage() {
    const [demoOrigin, setDemoOrigin] = useState('Jakarta');
    const [demoDestination, setDemoDestination] = useState('Surabaya');
    const [demoResult, setDemoResult] = useState<any>(null);
    const [demoLoading, setDemoLoading] = useState(false);

    // Demo API call
    const handleDemoCheck = async () => {
        setDemoLoading(true);
        try {
            const res = await fetch('/api/shipping/cost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: demoOrigin,
                    destination: demoDestination,
                    weight: 1000,
                    courier: 'jne',
                }),
            });
            const data = await res.json();
            setDemoResult(data);
        } catch (error) {
            console.error('Demo error:', error);
        } finally {
            setDemoLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            Logistics API for
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {' '}
                                Modern Businesses
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Integrate real-time shipping rates, package tracking, and AI-powered logistics into your
                            platform with just a few lines of code.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/console"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all"
                            >
                                🚀 Get API Key
                            </Link>
                            <a
                                href="#demo"
                                className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all"
                            >
                                🎯 Try Demo
                            </a>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-center mb-16">Why Choose CekKirim API?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '⚡',
                                title: 'Lightning Fast',
                                desc: 'Sub-200ms response time with global CDN caching',
                            },
                            {
                                icon: '🤖',
                                title: 'AI-Powered',
                                desc: 'Smart route optimization and predictive delivery times',
                            },
                            {
                                icon: '🔒',
                                title: 'Enterprise Security',
                                desc: 'SHA-512 encryption, rate limiting, and DDoS protection',
                            },
                            {
                                icon: '📊',
                                title: 'Real-time Analytics',
                                desc: 'Track API usage, performance metrics, and costs',
                            },
                            {
                                icon: '🌍',
                                title: '25+ Couriers',
                                desc: 'JNE, J&T, SiCepat, Ninja, and more across Indonesia',
                            },
                            {
                                icon: '💰',
                                title: 'Pay As You Go',
                                desc: 'No upfront costs. Only pay for what you use',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100 hover:shadow-xl transition-shadow"
                            >
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Demo */}
            <section id="demo" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-center mb-8">🎯 Try It Now</h2>
                    <p className="text-center text-gray-600 mb-10">
                        See our API in action. This is the ACTUAL engine powering thousands of e-commerce sites.
                    </p>

                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Origin City</label>
                                <input
                                    type="text"
                                    value={demoOrigin}
                                    onChange={(e) => setDemoOrigin(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Jakarta"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Destination City</label>
                                <input
                                    type="text"
                                    value={demoDestination}
                                    onChange={(e) => setDemoDestination(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., Surabaya"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleDemoCheck}
                            disabled={demoLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg"
                        >
                            {demoLoading ? '⏳ Calculating...' : '🚀 Check Shipping Rates'}
                        </button>

                        {demoResult && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                                <p className="text-sm text-green-800 font-mono mb-2">✅ API Response in {demoResult.response_time || '<200'}ms</p>
                                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                                    {JSON.stringify(demoResult, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-center mb-16">Simple, Transparent Pricing</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Starter',
                                price: 'Rp 500K',
                                period: '/month',
                                features: ['10,000 API calls/month', 'Basic support', 'Standard SLA', 'Email notifications'],
                                cta: 'Start Free Trial',
                                highlight: false,
                            },
                            {
                                name: 'Business',
                                price: 'Rp 2M',
                                period: '/month',
                                features: [
                                    '100,000 API calls/month',
                                    'Priority support',
                                    '99.9% uptime SLA',
                                    'WhatsApp alerts',
                                    'Custom webhooks',
                                ],
                                cta: 'Get Started',
                                highlight: true,
                            },
                            {
                                name: 'Enterprise',
                                price: 'Custom',
                                period: '',
                                features: [
                                    'Unlimited API calls',
                                    'Dedicated support',
                                    '99.99% uptime SLA',
                                    'On-premise option',
                                    'Custom integration',
                                ],
                                cta: 'Contact Sales',
                                highlight: false,
                            },
                        ].map((plan, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl p-8 ${plan.highlight
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl scale-105'
                                        : 'bg-gray-50 border-2 border-gray-200'
                                    }`}
                            >
                                <h3 className={`text-2xl font-bold mb-4 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h3>
                                <div className="mb-6">
                                    <span className={`text-5xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={plan.highlight ? 'text-blue-100' : 'text-gray-600'}>{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className={`flex items-start ${plan.highlight ? 'text-blue-50' : 'text-gray-600'}`}>
                                            <span className="mr-2">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/console"
                                    className={`block text-center py-3 rounded-lg font-bold ${plan.highlight
                                            ? 'bg-white text-blue-600 hover:bg-gray-100'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        } transition-all`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-white mb-6">Ready to Get Started?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join hundreds of businesses using CekKirim API to power their logistics
                    </p>
                    <Link
                        href="/console"
                        className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all"
                    >
                        🔑 Get Your API Key Now
                    </Link>
                </div>
            </section>
        </div>
    );
}
