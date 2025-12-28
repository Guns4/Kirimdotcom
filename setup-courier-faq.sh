#!/bin/bash

# =============================================================================
# Setup Courier FAQ (Phase 100)
# Helpful Content & Schema Markup
# =============================================================================

echo "Setting up Courier FAQ System..."
echo "================================================="
echo ""

# 1. Data Source
echo "1. Creating Data Source: src/data/courier-facts.json"
mkdir -p src/data

cat <<EOF > src/data/courier-facts.json
{
  "jne": {
    "name": "JNE Express",
    "call_center": "(021) 2927 8888",
    "email": "customercare@jne.co.id",
    "operational_hours": "Senin - Sabtu (08:00 - 19:30), Minggu (08:00 - 14:00) untuk agen utama.",
    "claim_terms": "Maksimal 14 hari setelah barang diterima. Wajib video unboxing untuk klaim asuransi."
  },
  "jnt": {
    "name": "J&T Express",
    "call_center": "021-8066-1888",
    "email": "jntcare@jet.co.id",
    "operational_hours": "Setiap Hari (08:00 - 20:00), termasuk hari libur nasional.",
    "claim_terms": "Klaim kerusakan maksimal 3 hari setelah status delivered."
  },
  "sicepat": {
    "name": "SiCepat Ekspres",
    "call_center": "021-5020-0050",
    "email": "social.media@sicepat.com",
    "operational_hours": "Setiap Hari (07:00 - 23:00) untuk operasional pengantaran.",
    "claim_terms": "Asuransi wajib untuk barang > 10x ongkir. Klaim via aplikasi SiCepat."
  }
}
EOF
echo "   [✓] Data source created."
echo ""

# 2. Components
echo "2. Creating Component: src/components/seo/CourierFAQ.tsx"
mkdir -p src/components/seo

cat <<EOF > src/components/seo/CourierFAQ.tsx
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
                'name': \`Berapa nomor Call Center \${data.name}?\`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': \`Call Center \${data.name} dapat dihubungi di nomor \${data.call_center} atau email \${data.email}.\`
                }
            },
            {
                '@type': 'Question',
                'name': \`Kapan jam operasional \${data.name}?\`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': data.operational_hours
                }
            },
            {
                '@type': 'Question',
                'name': \`Bagaimana syarat klaim ganti rugi \${data.name}?\`,
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
            <Script id={\`faq-schema-\${key}\`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

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
EOF
echo "   [✓] CourierFAQ Component created."
echo ""

# Instructions
echo "Next Step:"
echo "Import and use the component in your tracking pages:"
echo "<CourierFAQ courier=\"jne\" />"
echo ""

echo "================================================="
echo "Setup Complete!"
