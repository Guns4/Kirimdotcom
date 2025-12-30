import { getReports } from '@/app/actions/analytics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart, Lock, Unlock, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PurchaseButton } from './PurchaseButton';

export default async function DataMarketplace() {
  const reports = await getReports();

  return (
    <div className="p-8 space-y-8">
       <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Marketplace Data & Insight</h1>
          <p className="text-muted-foreground text-lg">Data strategis untuk ekspansi bisnis logistik Anda.</p>
       </div>

       <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {reports.map((report: any) => (
             <Card key={report.id} className="p-8 flex flex-col gap-6 relative overflow-hidden border-2 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl">
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-xl text-primary">
                         <FileBarChart className="w-8 h-8" />
                      </div>
                      <div>
                         <h3 className="font-bold text-xl">{report.title}</h3>
                         <Badge variant="secondary" className="mt-1">{report.report_type.replace('_', ' ').toUpperCase()}</Badge>
                      </div>
                   </div>
                   {report.isOwned ? <Unlock className="text-green-500 w-6 h-6" /> : <Lock className="text-muted-foreground w-6 h-6" />}
                </div>

                <p className="text-gray-600 leading-relaxed">
                   {report.description}
                </p>

                <div className="bg-muted/50 p-4 rounded-xl text-sm grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-muted-foreground block">Format</span>
                      <span className="font-bold">Excel & PDF</span>
                   </div>
                   <div className="space-y-1">
                      <span className="text-muted-foreground block">Update</span>
                      <span className="font-bold">Realtime</span>
                   </div>
                </div>

                <div className="mt-auto pt-6 border-t flex items-center justify-between">
                   {report.isOwned ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                         <Download className="w-5 h-5 mr-3" /> Download Data
                      </Button>
                   ) : (
                      <div className="w-full flex items-center justify-between gap-6">
                         <div>
                            <span className="text-xs text-muted-foreground block uppercase font-semibold">Harga Akses</span>
                            <span className="font-bold text-2xl text-primary">Rp {Number(report.price).toLocaleString()}</span>
                         </div>
                         <PurchaseButton id={report.id} price={Number(report.price)} />
                      </div>
                   )}
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
}
