import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function StatusPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <Link href="/business" className="inline-block text-2xl font-bold text-slate-900 mb-2">CekKirim API</Link>
                    <h1 className="text-4xl font-extrabold text-slate-900">System Status</h1>
                </div>

                {/* Overall Status */}
                <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">All Systems Operational</h2>
                        <p className="text-green-100 opacity-90">Last updated: Just now</p>
                    </div>
                    <CheckCircle size={48} className="opacity-80" />
                </div>

                {/* Detailed Services */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <ServiceRow name="API Gateway (v1)" status="OPERATIONAL" />
                    <ServiceRow name="Shipping Engine" status="OPERATIONAL" />
                    <ServiceRow name="Tracking Webhooks" status="OPERATIONAL" />
                    <ServiceRow name="Billing System" status="OPERATIONAL" />
                    <ServiceRow name="Dashboard Console" status="OPERATIONAL" />
                </div>

                {/* Incidents History */}
                <div className="mt-12">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Past Incidents</h3>
                    <div className="space-y-4">
                        <div className="text-slate-500 text-sm">No incidents reported today.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ServiceRow({ name, status }: any) {
    return (
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center last:border-0">
            <span className="font-bold text-slate-700">{name}</span>
            <span className="flex items-center gap-2 text-green-600 font-bold text-sm">
                <CheckCircle size={16} /> {status}
            </span>
        </div>
    );
}
