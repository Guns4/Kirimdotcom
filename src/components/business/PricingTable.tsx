import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Developer",
        price: "Rp 0",
        period: "/ selamanya",
        desc: "Untuk testing dan proyek hobi.",
        features: ["100 Requests / bulan", "Semua Kurir Reguler", "Community Support", "Basic Tracking"],
        cta: "Mulai Gratis",
        popular: false
    },
    {
        name: "Startup",
        price: "Rp 299.000",
        period: "/ bulan",
        desc: "Untuk bisnis yang mulai bertumbuh.",
        features: ["10.000 Requests / bulan", "Prioritas Support", "Webhook Notifications", "Semua Kurir (Instant & Cargo)"],
        cta: "Pilih Startup",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Hubungi Kami",
        period: "",
        desc: "Volume tinggi dan kebutuhan khusus.",
        features: ["Unlimited Requests", "SLA Agreement 99.9%", "Dedicated Account Manager", "Custom Integration"],
        cta: "Kontak Sales",
        popular: false
    }
];

export default function PricingTable() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Harga Simpel & Transparan</h2>
                    <p className="text-slate-600">Pilih paket yang sesuai dengan skala bisnis Anda. Upgrade kapan saja.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div key={idx} className={`relative bg-white rounded-2xl shadow-xl border ${plan.popular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-slate-100'} p-8 flex flex-col`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                    Paling Laris
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline mb-2">
                                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-500 ml-2">{plan.period}</span>
                                </div>
                                <p className="text-slate-500 text-sm">{plan.desc}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-center text-slate-700">
                                        <Check className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                                        <span className="text-sm">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/console"
                                className={`w-full block text-center py-4 rounded-xl font-bold transition-all ${plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
