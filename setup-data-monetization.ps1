# Big Data Monetization: Business Insights (PowerShell)

Write-Host "Initializing Data Monetization System..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. SQL Schema
Write-Host "1. Generating SQL Schema: data_monetization_schema.sql" -ForegroundColor Yellow
$sqlContent = @'
-- 1. Anonymized Analytical View
-- Aggregates data for reporting (Safe for public consumption)
CREATE OR REPLACE VIEW view_anonymized_trends AS
SELECT 
    TO_CHAR(created_at, 'YYYY-MM') as month_period,
    origin_city,
    destination_city,
    courier,
    COUNT(*) as shipment_count,
    SUM(package_weight) as total_weight_grams
FROM public.shipping_bookings
WHERE status IN ('picked_up', 'completed', 'confirmed') -- Only valid shipments
GROUP BY 1, 2, 3, 4;

-- 2. Report Catalog (Products)
CREATE TABLE IF NOT EXISTS public.business_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) DEFAULT 500000,
  report_type VARCHAR(50), -- 'monthly_trend', 'city_analysis'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Reports
INSERT INTO public.business_reports (title, description, price, report_type)
VALUES 
  ('Laporan Tren Logistik Q1 2025', 'Analisa lengkap pengiriman domestik, top rute, dan performa kurir Q1.', 750000, 'monthly_trend'),
  ('Top 10 Kota Tujuan E-Commerce', 'Data volume pengiriman terlaris berdasarkan kota tujuan untuk strategi pemasaran.', 500000, 'city_analysis')
ON CONFLICT DO NOTHING;

-- 3. Purchases
CREATE TABLE IF NOT EXISTS public.report_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  report_id UUID REFERENCES public.business_reports(id) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  price_paid DECIMAL(12,2) NOT NULL,
  UNIQUE(user_id, report_id)
);

-- RLS
ALTER TABLE public.business_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reports" ON public.business_reports;
CREATE POLICY "Public read reports" ON public.business_reports FOR SELECT USING (is_active = true);

ALTER TABLE public.report_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User read purchases" ON public.report_purchases;
CREATE POLICY "User read purchases" ON public.report_purchases FOR SELECT USING (auth.uid() = user_id);
'@
$sqlContent | Set-Content -Path "data_monetization_schema.sql" -Encoding UTF8
Write-Host "   [?] SQL schema generated." -ForegroundColor Green

# 2. Server Actions
Write-Host "2. Creating Actions: src\app\actions\analytics.ts" -ForegroundColor Yellow
$dirAction = "src\app\actions"
if (!(Test-Path $dirAction)) { New-Item -ItemType Directory -Force -Path $dirAction | Out-Null }

$actionContent = @'
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getReports() {
  const supabase = await createClient();
  const { data } = await supabase.from('business_reports').select('*').eq('is_active', true);
  
  // Check ownership
  const { data: { user } } = await supabase.auth.getUser();
  let ownedIds: string[] = [];
  
  if (user) {
     const { data: purchases } = await supabase.from('report_purchases').select('report_id').eq('user_id', user.id);
     if (purchases) ownedIds = purchases.map(p => p.report_id);
  }

  return data?.map(r => ({
     ...r,
     isOwned: ownedIds.includes(r.id)
  })) || [];
}

export async function purchaseReport(reportId: string, price: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login required' };

  // 1. Debit Wallet
  const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user.id).single();
  if (!wallet || Number(wallet.balance) < price) return { error: 'Saldo tidak mencukupi.' };

  // Atomic Ledger Insert (DEBIT)
  const { error: debitError } = await supabase.from('ledger_entries').insert({
     wallet_id: wallet.id,
     amount: price,
     entry_type: 'DEBIT',
     description: 'Purchase Data Report',
     reference_id: reportId
  });

  if (debitError) return { error: 'Gagal memproses pembayaran.' };

  // 2. Record Purchase
  const { error: purchError } = await supabase.from('report_purchases').insert({
     user_id: user.id,
     report_id: reportId,
     price_paid: price
  });

  if (purchError) return { error: 'Gagal mencatat pembelian. Hubungi CS.' };
  
  revalidatePath('/business/data');
  return { success: true };
}

export async function getReportData(reportId: string) {
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return null;

   // Verify ownership
   const { data: purchase } = await supabase
      .from('report_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('report_id', reportId)
      .single();

   if (!purchase) return null; // Access Denied

   // Return Dummy Data derived from View
   const { data: trends } = await supabase.from('view_anonymized_trends').select('*').limit(50);
   return trends;
}
'@
$actionContent | Set-Content -Path "src\app\actions\analytics.ts" -Encoding UTF8
Write-Host "   [?] Server Action created." -ForegroundColor Green

# 3. UI Components
Write-Host "3. Creating UI Component: src\app\business\data\page.tsx" -ForegroundColor Yellow
$dirUI = "src\app\business\data"
if (!(Test-Path $dirUI)) { New-Item -ItemType Directory -Force -Path $dirUI | Out-Null }

$pageContent = @'
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
'@
$pageContent | Set-Content -Path "src\app\business\data\page.tsx" -Encoding UTF8

$btnContent = @'
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { purchaseReport } from '@/app/actions/analytics';
import { toast } from 'sonner';

export function PurchaseButton({ id, price }: { id: string, price: number }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
     if(!confirm(`Beli laporan ini seharga Rp ${price.toLocaleString()}?`)) return;
     setLoading(true);
     const res = await purchaseReport(id, price);
     setLoading(false);
     if(res.error) toast.error(res.error);
     else toast.success('Berhasil dibeli! Akses terbuka.');
  };

  return (
    <Button onClick={handleBuy} disabled={loading} className="h-12 px-8 text-lg font-semibold">
       {loading ? 'Memproses...' : 'Beli Akses'}
    </Button>
  );
}
'@
$btnContent | Set-Content -Path "src\app\business\data\PurchaseButton.tsx" -Encoding UTF8
Write-Host "   [?] UI components created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Data Monetization Ready!" -ForegroundColor Green
Write-Host "1. Run 'data_monetization_schema.sql'." -ForegroundColor White
Write-Host "2. Visit '/business/data' to see the marketplace." -ForegroundColor White
Write-Host "3. Reports are generated from 'view_anonymized_trends'." -ForegroundColor White
