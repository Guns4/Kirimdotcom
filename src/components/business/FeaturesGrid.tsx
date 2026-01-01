import { Globe, ShieldCheck, Cpu, Truck, BarChart3, Lock } from 'lucide-react';

const features = [
    {
        icon: <Globe className="h-8 w-8 text-blue-500" />,
        title: "Cakupan Nasional",
        desc: "Database wilayah lengkap hingga tingkat kelurahan di seluruh Indonesia."
    },
    {
        icon: <Cpu className="h-8 w-8 text-purple-500" />,
        title: "AI Prediction Engine",
        desc: "Estimasi waktu tiba (ETA) yang lebih akurat menggunakan Machine Learning."
    },
    {
        icon: <Truck className="h-8 w-8 text-emerald-500" />,
        title: "Multi-Ekspedisi",
        desc: "Satu API untuk JNE, J&T, SiCepat, Anteraja, GoSend, dan GrabExpress."
    },
    {
        icon: <BarChart3 className="h-8 w-8 text-orange-500" />,
        title: "Analytics Dashboard",
        desc: "Pantau penggunaan API, biaya, dan performa pengiriman dalam satu dashboard."
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
        title: "SLA Terjamin",
        desc: "Jaminan uptime 99.9% dengan infrastruktur cloud yang redundant."
    },
    {
        icon: <Lock className="h-8 w-8 text-slate-500" />,
        title: "Secure & Compliant",
        desc: "Keamanan tingkat tinggi dengan enkripsi end-to-end dan IP Whitelisting."
    }
];

export default function FeaturesGrid() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Kenapa Developer Memilih CekKirim API?</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">Kami membangun tools yang kami sendiri ingin gunakan. Cepat, dokumentasi jelas, dan dukungan teknis langsung dari engineer.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="mb-4 bg-white p-3 rounded-lg w-fit shadow-sm border border-slate-100">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
