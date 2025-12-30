import { getMyCampaigns } from '@/app/actions/ads';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointer } from 'lucide-react';
import Image from 'next/image';

interface Campaign {
    id: string;
    campaign_name: string;
    banner_url: string;
    status: string;
    total_impressions: number;
    total_clicks: number;
    current_balance: number;
}

export async function AdsDashboard() {
    const campaigns = await getMyCampaigns();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Kampanye Saya</h2>
            <div className="grid gap-4">
                {(campaigns as Campaign[]).map((camp) => (
                    <div key={camp.id} className="flex flex-col md:flex-row items-center gap-4 bg-card border p-4 rounded-xl">
                        <div className="w-24 h-16 relative rounded-md overflow-hidden bg-muted">
                            {camp.banner_url && (
                                <Image src={camp.banner_url} alt={camp.campaign_name} fill className="object-cover" />
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold">{camp.campaign_name}</h3>
                                <Badge variant={camp.status === 'active' ? 'default' : 'secondary'}>{camp.status}</Badge>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {camp.total_impressions || 0} Views</span>
                                <span className="flex items-center gap-1"><MousePointer className="w-4 h-4" /> {camp.total_clicks || 0} Clicks</span>
                            </div>
                        </div>

                        <div className="text-right min-w-[120px]">
                            <p className="text-xs text-muted-foreground">Sisa Saldo</p>
                            <p className="font-bold text-lg text-primary">
                                Rp {(camp.current_balance || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                ))}
                {campaigns.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada iklan.</p>}
            </div>
        </div>
    );
}
