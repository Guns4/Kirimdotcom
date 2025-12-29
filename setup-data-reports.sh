#!/bin/bash

# =============================================================================
# Big Data Monetization: Business Insights
# =============================================================================

echo "Initializing Data Monetization System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL Schema: data_monetization_schema.sql"
cat <<EOF > data_monetization_schema.sql
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
  ('Top 10 Kota Tujuan E-Commerce', 'Data volume pengiriman terlaris berdasarkan kota tujuan untuk strategi pemasaran.', 500000, 'city_analysis');

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
CREATE POLICY "Public read reports" ON public.business_reports FOR SELECT USING (is_active = true);

ALTER TABLE public.report_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User read purchases" ON public.report_purchases FOR SELECT USING (auth.uid() = user_id);
EOF

# 2. Server Actions
echo "2. Creating Actions: src/app/actions/analytics.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/analytics.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getReports() {
  const supabase = createClient();
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
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Login required' };

  // 1. Debit Wallet
  const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user.id).single();
  if (!wallet || wallet.balance < price) return { error: 'Saldo tidak mencukupi.' };

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
   const supabase = createClient();
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

   // Return Dummy Data derived from View (In real app, filter view based on report type)
   const { data: trends } = await supabase.from('view_anonymized_trends').select('*').limit(50);
   return trends;
}
EOF

# 3. UI Components
echo "3. Creating UI: src/app/business/data/page.tsx"
mkdir -p src/app/business/data
cat <<EOF > src/app/business/data/page.tsx
import { getReports } from '@/app/actions/analytics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart, Lock, Unlock, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PurchaseButton } from './PurchaseButton'; // Client Comp

export default async function DataMarketplace() {
  const reports = await getReports();

  return (
    <div className="p-8 space-y-8">
       <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Marketplace Data & Insight</h1>
          <p className="text-muted-foreground">Data strategis untuk ekspansi bisnis logistik Anda.</p>
       </div>

       <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {reports.map((report: any) => (
             <Card key={report.id} className="p-6 flex flex-col gap-4 relative overflow-hidden border-2 hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                         <FileBarChart className="w-6 h-6" />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg">{report.title}</h3>
                         <Badge variant="outline">{report.report_type}</Badge>
                      </div>
                   </div>
                   {report.isOwned ? <Unlock className="text-green-500" /> : <Lock className="text-muted-foreground" />}
                </div>

                <p className="text-sm text-gray-500 flex-1">
                   {report.description}
                </p>

                <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                   <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="font-bold">Excel & PDF</span>
                   </div>
                   <div className="flex justify-between">
                      <span>Update:</span>
                      <span className="font-bold">Realtime</span>
                   </div>
                </div>

                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                   {report.isOwned ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                         <Download className="w-4 h-4 mr-2" /> Download Data
                      </Button>
                   ) : (
                      <div className="w-full flex items-center justify-between gap-4">
                         <div className="font-bold text-lg">Rp {report.price.toLocaleString()}</div>
                         <PurchaseButton id={report.id} price={report.price} />
                      </div>
                   )}
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
}
EOF

# Client Button
cat <<EOF > src/app/business/data/PurchaseButton.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { purchaseReport } from '@/app/actions/analytics';
import { toast } from 'sonner';

export function PurchaseButton({ id, price }: { id: string, price: number }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
     if(!confirm(\`Beli laporan ini seharga Rp \${price.toLocaleString()}?\`)) return;
     setLoading(true);
     const res = await purchaseReport(id, price);
     setLoading(false);
     if(res.error) toast.error(res.error);
     else toast.success('Berhasil dibeli! Akses terbuka.');
  };

  return (
    <Button onClick={handleBuy} disabled={loading}>
       {loading ? 'Memproses...' : 'Beli Akses'}
    </Button>
  );
}
EOF

echo ""
echo "================================================="
echo "Data Monetization Ready!"
echo "1. Run 'data_monetization_schema.sql'."
echo "2. Visit '/business/data' to see the marketplace."
echo "3. Reports are generated from 'view_anonymized_trends'."
