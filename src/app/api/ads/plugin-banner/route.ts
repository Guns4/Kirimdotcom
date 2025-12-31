import { NextResponse } from 'next/server';

export async function GET() {
    // Dynamic Ad Content
    return NextResponse.json({
        show: true,
        image_url: 'https://placehold.co/600x150/orange/white?text=Promo+Lakban+Rp+7000',
        link: 'https://cekkirim.com/shop/supplies/lakban-bening',
        text: '🔥 Promo Eksklusif: Beli Lakban untuk packing, harga termurah se-Indonesia! Klik di sini.',
        cta_text: 'Beli Stok (Potong Saldo)'
    });
}
