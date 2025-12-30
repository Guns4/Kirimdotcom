import { ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export async function InsuranceBadge({ resi }: { resi: string }) {
    const supabase = await createClient();
    const { data } = await (supabase as any)
        .from('package_insurances')
        .select('status, coverage_amount')
        .eq('resi_number', resi)
        .single();

    if (!data) return null;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dilindungi s.d Rp {data.coverage_amount.toLocaleString('id-ID')}</span>
        </div>
    );
}
