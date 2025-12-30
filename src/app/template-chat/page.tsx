'use client';

import { useState } from 'react';
import { Copy, Check, MessageCircle, Phone } from 'lucide-react';
import { Metadata } from 'next';

// Client side component doesn't export metadata effectively in same file usually if using 'use client',
// but Next.js App Router allows strict separation.
// For simplicity in this tool, we'll keep it client-side for interaction.

const TEMPLATES = [
  {
    title: 'Konfirmasi Order',
    content: `Halo Kak, terima kasih sudah order di toko kami! 🙏\nPesanan Kakak sudah kami terima dan akan segera diproses hari ini. Mohon ditunggu updatenya ya kak. 😊`,
  },
  {
    title: 'Info Resi',
    content: `Halo Kak, paket pesanan Kakak sudah kami kirim ya! 🚚\nNo Resi: [ISI_RESI]\nEkspedisi: [ISI_KURIR]\n\nBisa langsung di cek di: https://cekkirim.com\nTerima kasih sudah belanja!`,
  },
  {
    title: 'Paket Sampai',
    content: `Halo Kak, status paketnya sudah TERKIRIM ya. 📦\nMohon dicek apakah barangnya sudah diterima dengan baik? \nKalau sudah, jangan lupa beri bintang 5 ya kak. Terima kasih! ⭐⭐⭐⭐⭐`,
  },
  {
    title: 'Konfirmasi Pembayaran',
    content: `Halo Kak, pembayaran sebesar Rp [NOMINAL] sudah kami terima. ✅\nPesanan akan segera kami siapkan. Terima kasih!`,
  },
  {
    title: 'Stok Kosong',
    content: `Halo Kak, mohon maaf sekali untuk produk [NAMA_PRODUK] yang kakak pesan ternyata stoknya barusan habis. 🙏\nApakah berkenan ganti warna/model lain? Kami punya rekomendasi yang bagus juga lho.`,
  },
  {
    title: 'Follow Up (Belum Bayar)',
    content: `Halo Kak, kami melihat ada pesanan yang belum diselesaikan pembayarannya. Apakah ada kendala saat transfer? \nKalau butuh bantuan bisa info ke kami ya kak. Stok produknya terbatas lho, yuk diamankan! 😉`,
  },
];

export default function TemplateChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <MessageCircle className="w-10 h-10 text-green-500" />
            Template Chat Seller
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Kumpulan template chat WhatsApp yang paling sering digunakan seller
            online. Tinggal copy-paste, edit sedikit, kirim!
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEMPLATES.map((template, index) => (
            <TemplateCard key={index} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
}: {
  template: { title: string; content: string };
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWA = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(template.content)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <div className="w-1 h-6 bg-green-500 rounded-full" />
        {template.title}
      </h3>

      <div className="bg-slate-900/50 rounded-xl p-4 mb-4 flex-1 text-sm text-gray-300 whitespace-pre-line border border-slate-800">
        {template.content}
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={handleCopy}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? 'Disalin!' : 'Copy Teks'}
        </button>
        <button
          onClick={handleOpenWA}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Kirim WA
        </button>
      </div>
    </div>
  );
}
