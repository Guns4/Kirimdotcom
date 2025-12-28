import facts from '@/data/courier-facts.json';
import { Phone, Clock, AlertCircle, Mail } from 'lucide-react';
import Script from 'next/script';

type CourierKey = keyof typeof facts;

export default function CourierFAQ({ courier }: { courier: string }) {
    const key = courier.toLowerCase() as CourierKey;
    const data = facts[key];

    if (!data) return null;

    // JSON-LD Schema for FAQPage
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': `Berapa nomor Call Center ${data.name}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `Call Center ${data.name} dapat dihubungi di nomor ${data.call_center} atau email ${data.email}.`
                }
            },
            {
                '@type': 'Question',
                'name': `Kapan jam operasional ${data.name}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': data.operational_hours
                }
            },
            {
                '@type': 'Question',
                'name': `Bagaimana syarat klaim ganti rugi ${data.name}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': data.claim_terms
                }
            }
        ]
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
                Informasi & Bantuan {data.name}
            </h2>

            {/* Structured Data injection */}
            <Script id={`faq-schema-${key}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

            <div className="grid md:grid-cols-2 gap-6">
                {/* Contact */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Call Center</h3>
                            <p className="text-indigo-600 font-medium text-lg">{data.call_center}</p>
                            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                <Mail className="w-3 h-3" />
                                {data.email}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="bg-green-50 p-2 rounded-lg text-green-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Jam Operasional</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{data.operational_hours}</p>
                        </div>
                    </div>
                </div>

                {/* Terms */}
                <div className="bg-orange-50/50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-orange-900 text-sm">Syarat Klaim</h3>
                            <p className="text-orange-800 text-sm mt-1 leading-relaxed">{data.claim_terms}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
