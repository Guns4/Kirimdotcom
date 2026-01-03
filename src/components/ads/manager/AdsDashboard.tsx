import { getMyCampaigns } from '@/app/actions/ads';
import { Badge } from '@/components/ui/badge';

export async function AdsDashboard() {
  const campaigns = await getMyCampaigns();

  return (
    <div className="space-y-4">
       <h2 className="text-xl font-bold">Kampanye Saya</h2>
       <div className="grid gap-4">
          {campaigns.map((camp: any) => (
             <div key={camp.id} className="flex flex-col md:flex-row items-center gap-4 bg-card border p-4 rounded-xl">
                 <img src={camp.banner_url} alt={camp.campaign_name} className="w-24 h-16 object-cover rounded-md bg-muted" />
                 
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <h3 className="font-bold">{camp.campaign_name}</h3>
                       <Badge variant={camp.status === 'active' ? 'default' : 'secondary'}>{camp.status}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                       <span>👁 {camp.total_impressions} Views</span>
                       <span>🖱 {camp.total_clicks} Clicks</span>
                    </div>
                 </div>

                 <div className="text-right min-w-[120px]">
                    <p className="text-xs text-muted-foreground">Sisa Saldo</p>
                    <p className="font-bold text-lg text-primary">
                       Rp {camp.current_balance?.toLocaleString()}
                    </p>
                 </div>
             </div>
          ))}
          {campaigns.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada iklan.</p>}
       </div>
    </div>
  );
}
