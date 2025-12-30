'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, ShieldCheck } from 'lucide-react';

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
        const link = `${window.location.origin}/pay/${mockTrx}?${params.toString()}`;

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
                                onChange={e => setFormData({ ...formData, itemName: e.target.value })}
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
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-muted-foreground">Ongkir (Rp)</label>
                                <Input
                                    required
                                    type="number"
                                    placeholder="20000"
                                    value={formData.shipping}
                                    onChange={e => setFormData({ ...formData, shipping: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground">Nama Toko/Penjual</label>
                            <Input
                                required
                                placeholder="Toko Bagus"
                                value={formData.sellerName}
                                onChange={e => setFormData({ ...formData, sellerName: e.target.value })}
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
