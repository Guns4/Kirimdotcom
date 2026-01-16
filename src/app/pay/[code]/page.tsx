'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

export default async function PaymentPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
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
                            Link Transaksi: {code}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
