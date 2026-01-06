import { AdsDashboard } from '@/components/ads/manager/AdsDashboard';
import { CreateCampaignForm } from '@/components/ads/manager/CreateCampaignForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdsManagerPage() {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Manager Iklan Mandiri
          </h1>
          <p className="text-muted-foreground">
            Pasang iklan produk Anda dan jangkau ribuan pengunjung Kirimdotcom
            setiap hari.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5 mr-2" /> Pasang Iklan Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Buat Kampanye Baru</DialogTitle>
              <DialogDescription>
                Isi detail iklan Anda di bawah ini. Iklan akan langsung tayang
                setelah pembayaran saldo awal.
              </DialogDescription>
            </DialogHeader>
            <CreateCampaignForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8">
        {/* Summary / Stats could go here later */}

        <div className="bg-muted/30 p-1 rounded-xl">
          <AdsDashboard />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 rounded-xl border bg-card/50">
          <h3 className="font-bold mb-2">🎯 Target Tepat</h3>
          <p className="text-sm text-muted-foreground">
            Iklan Anda muncul saat user melacak paket (High Intent).
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card/50">
          <h3 className="font-bold mb-2">💰 Biaya Terjangkau</h3>
          <p className="text-sm text-muted-foreground">
            Hanya bayar saat iklan dilihat (CPV) mulai Rp 100.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card/50">
          <h3 className="font-bold mb-2">📊 Transparan</h3>
          <p className="text-sm text-muted-foreground">
            Pantau performa iklan, views, dan saldo secara realtime.
          </p>
        </div>
      </div>
    </div>
  );
}
