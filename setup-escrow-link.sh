#!/bin/bash

# =============================================================================
# High Income Transaction: Escrow Link System
# =============================================================================

echo "Initializing Rekber Link System..."
echo "================================================="

# 1. SQL Update
echo "1. Generating SQL Update: escrow_link_update.sql"
cat <<EOF > escrow_link_update.sql
-- Add fields for simple link escrow & disputes
ALTER TABLE public.escrow_transactions 
ADD COLUMN IF NOT EXISTS item_name TEXT DEFAULT 'Barang Fisik',
ADD COLUMN IF NOT EXISTS auto_release_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_disputed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT;

-- Update status enum if strictly constrained, or just handle logic in app
-- Assuming varchar(30) so we can insert 'disputed' freely.

-- Function to file dispute
CREATE OR REPLACE FUNCTION file_dispute(
  p_escrow_id UUID,
  p_reason TEXT,
  p_actor_id UUID
) RETURNS BOOLEAN AS \$\$
BEGIN
  UPDATE public.escrow_transactions
  SET is_disputed = TRUE,
      dispute_reason = p_reason,
      status = 'disputed',
      updated_at = NOW()
  WHERE id = p_escrow_id 
  AND (buyer_id = p_actor_id OR seller_id = p_actor_id); -- Only parties can dispute
  
  IF FOUND THEN
    INSERT INTO public.escrow_history (escrow_id, event_type, description, actor_id, actor_type)
    VALUES (p_escrow_id, 'dispute_filed', p_reason, p_actor_id, 'user');
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
\$\$ LANGUAGE plpgsql;
EOF

# 2. Create Page: Seller Link Generator
echo "2. Creating Seller Page: src/app/pay/create/page.tsx"
mkdir -p src/app/pay/create
cat <<EOF > src/app/pay/create/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Copy, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CreateEscrowLink() {
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  
  const [formData, setFormData] = useState({
    itemName: '',
    price: '',
    shipping: '',
    sellerName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In a real app, we might create a Draft Escrow ID here.
    // For simplicity, we encode params to URL first (Stateless) OR create a Pending record.
    // Let's create a pending record to get a real Code.
    
    // Attempt to call a server action or use supabase directly
    // This is a simplified "Mock" generation for the script demo purpose
    // Ideally calls createEscrowTransaction() but that requires buyer_id usually.
    // We will simulate a "Pre-Escrow" link.
    
    // Real flow:
    // 1. Seller creates "Payment Link" record (new table `payment_links`).
    // 2. Buyer visits link -> Creates Escrow.
    // For this task, we'll encode data in URL to be simple (No database write until Buyer clicks).
    
    const params = new URLSearchParams({
        item: formData.itemName,
        price: formData.price,
        shipping: formData.shipping,
        seller: formData.sellerName
    });
    
    // Pseudo-code TRX ID
    const mockTrx = 'TRX' + Math.floor(Math.random() * 999999);
    
    // In production, save this state to DB!
    const link = \`\${window.location.origin}/pay/\${mockTrx}?\${params.toString()}\`;
    
    setGeneratedLink(link);
    setLoading(false);
    toast.success('Link pembayaran dibuat!');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 border-primary/20 bg-card">
         <div className="text-center mb-6">
            <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
               Buat Link Rekber
            </h1>
            <p className="text-muted-foreground text-sm">Amankan transaksi COD/Online Anda</p>
         </div>

         {!generatedLink ? (
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground">Nama Barang</label>
                    <Input 
                        required 
                        placeholder="Ex: iPhone 13 Pro 256GB" 
                        value={formData.itemName}
                        onChange={e => setFormData({...formData, itemName: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground">Harga (Rp)</label>
                        <Input 
                            required 
                            type="number" 
                            placeholder="10000000"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground">Ongkir (Rp)</label>
                        <Input 
                            required 
                            type="number" 
                            placeholder="20000"
                            value={formData.shipping}
                            onChange={e => setFormData({...formData, shipping: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                   <label className="text-xs font-bold uppercase text-muted-foreground">Nama Toko/Penjual</label>
                    <Input 
                        required 
                        placeholder="Toko Bagus" 
                        value={formData.sellerName}
                        onChange={e => setFormData({...formData, sellerName: e.target.value})}
                    />
                </div>
                
                <Button type="submit" className="w-full font-bold" disabled={loading}>
                   {loading ? 'Membuat Link...' : 'Generate Link Pembayaran'}
                </Button>
             </form>
         ) : (
            <div className="space-y-4 animate-in fade-in">
                <div className="bg-muted p-4 rounded-lg break-all text-sm font-mono text-center border border-dashed border-primary">
                    {generatedLink}
                </div>
                <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        toast.success('Disalin!');
                    }}
                >
                    <Copy className="w-4 h-4" /> Salin Link
                </Button>
                <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setGeneratedLink('')}
                >
                    Buat Baru
                </Button>
            </div>
         )}
      </Card>
    </div>
  );
}
EOF

# 3. Create Page: Buyer Payment Flow
echo "3. Creating Buyer Page: src/app/pay/[code]/page.tsx"
mkdir -p src/app/pay/\[code\]
cat <<EOF > src/app/pay/\[code\]/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Smartphone, AlertTriangle } from 'lucide-react';

export default function PaymentPage({ params }: { params: { code: string } }) {
  const searchParams = useSearchParams();
  const item = searchParams.get('item') || 'Unknown Item';
  const price = Number(searchParams.get('price')) || 0;
  const shipping = Number(searchParams.get('shipping')) || 0;
  const seller = searchParams.get('seller') || 'Seller';
  
  const total = price + shipping + 1000; // Admin fee

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-black/50">
       <Card className="w-full max-w-lg overflow-hidden border-0 shadow-2xl">
          {/* Header */}
          <div className="bg-black text-white p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/20 pattern-grid-lg opacity-30" />
              <Shield className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <h1 className="text-xl font-bold relative z-10">CekKirim Rekber</h1>
              <p className="text-sm text-gray-400">Secure Escrow Transaction</p>
          </div>

          <div className="p-6 space-y-6 bg-card">
              {/* Transaction Details */}
              <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                      <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold">Item</p>
                          <p className="font-medium text-lg">{item}</p>
                          <p className="text-xs text-muted-foreground">Sold by {seller}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs text-muted-foreground uppercase font-bold">Total</p>
                         <p className="font-bold text-xl text-primary">Rp {total.toLocaleString('id-ID')}</p>
                      </div>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3">
                     <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                     <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        Uang Anda akan <strong>ditahan</strong> oleh CekKirim sampai barang diterima. Penjual tidak menerima uang sebelum Anda konfirmasi.
                     </p>
                  </div>
              </div>

              {/* Action */}
              <div className="space-y-3 pt-2">
                 <Button className="w-full h-12 text-lg font-bold shadow-lg" size="lg">
                    Bayar Sekarang (QRIS/E-Wallet)
                 </Button>
                 <p className="text-xs text-center text-muted-foreground">
                    Link Transaksi: {params.code}
                 </p>
              </div>
          </div>
       </Card>
    </div>
  );
}
EOF

echo ""
echo "================================================="
echo "Rekber Link System Ready!"
echo "1. Run 'escrow_link_update.sql' in Supabase."
echo "2. Visit '/pay/create' to generate a payment link."
echo "3. Visit the generated link to see the Payment UI."
