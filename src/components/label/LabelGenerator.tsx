'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Download,
  Save,
  Trash2,
  Tag,
  Copy,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

// Types
interface LabelData {
  sender: {
    name: string;
    phone: string;
  };
  receiver: {
    name: string;
    phone: string;
    address: string;
  };
  details: {
    courier: string;
    resi: string;
    date: string;
    note: string;
    weight: string;
  };
}

const COURIERS = [
  'JNE',
  'J&T',
  'SiCepat',
  'AnterAja',
  'ID Express',
  'Ninja Xpress',
  'Lion Parcel',
  'POS Indonesia',
  'Wahana',
  'GoSend',
  'GrabExpress',
];

export function LabelGenerator() {
  // State
  const [data, setData] = useState<LabelData>({
    sender: { name: '', phone: '' },
    receiver: { name: '', phone: '', address: '' },
    details: {
      courier: 'JNE',
      resi: '',
      date: new Date().toISOString().split('T')[0],
      note: 'Fragile / Barang Mudah Pecah',
      weight: '1',
    },
  });

  const [saveSender, setSaveSender] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load saved sender on mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_sender');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => ({
          ...prev,
          sender: parsed,
        }));
        setSaveSender(true);
      } catch (e) {
        console.error('Failed to parse saved sender', e);
      }
    }
  }, []);

  // Save sender logic
  const handleSaveSenderChange = (checked: boolean) => {
    setSaveSender(checked);
    if (checked) {
      localStorage.setItem('saved_sender', JSON.stringify(data.sender));
    } else {
      localStorage.removeItem('saved_sender');
    }
  };

  // Update sender & auto-save if enabled
  const updateSender = (field: keyof typeof data.sender, value: string) => {
    const newSender = { ...data.sender, [field]: value };
    setData((prev) => ({ ...prev, sender: newSender }));

    if (saveSender) {
      localStorage.setItem('saved_sender', JSON.stringify(newSender));
    }
  };

  // PDF Generation Logic
  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Dimensions for A6 (105 x 148 mm) - standard thermal label
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150],
      });

      // Canvas for barcode generation if needed
      const canvas = document.createElement('canvas');

      // HEADER: Courier & Date
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(data.details.courier.toUpperCase(), 5, 12);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(data.details.date, 95, 12, { align: 'right' });

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(5, 15, 95, 15);

      let currentY = 20;

      // RESI / BARCODE SECTION
      if (data.details.resi) {
        try {
          JsBarcode(canvas, data.details.resi, {
            format: 'CODE128',
            displayValue: true,
            fontSize: 14,
            width: 2,
            height: 30,
            margin: 0,
          });
          const barcodeData = canvas.toDataURL('image/png');
          doc.addImage(barcodeData, 'PNG', 5, currentY, 90, 25);
          currentY += 30;
        } catch (e) {
          console.error('Barcode generation error', e);
          doc.setFontSize(14);
          doc.text(`No. Resi: ${data.details.resi}`, 5, currentY + 5);
          currentY += 10;
        }
      }

      // Line separator
      doc.line(5, currentY, 95, currentY);
      currentY += 5;

      // RECEIVER SECTION (Dominant)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PENERIMA (Receiver):', 5, currentY);
      currentY += 5;

      doc.setFontSize(14);
      doc.text(data.receiver.name || '-', 5, currentY);
      currentY += 6;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(data.receiver.phone || '-', 5, currentY);
      currentY += 6;

      doc.setFontSize(11);
      // Multi-line address
      const splitAddress = doc.splitTextToSize(
        data.receiver.address || '-',
        90
      );
      doc.text(splitAddress, 5, currentY);
      currentY += splitAddress.length * 5 + 5;

      // Line separator
      doc.line(5, currentY, 95, currentY);
      currentY += 5;

      // SENDER SECTION
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PENGIRIM (Sender):', 5, currentY);
      currentY += 4;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${data.sender.name} - ${data.sender.phone}`, 5, currentY);
      currentY += 6;

      // FOOTER: Note & Weight
      doc.setFillColor(240, 240, 240);
      doc.rect(5, 130, 90, 15, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Berat: ${data.details.weight} kg`, 8, 135);

      if (data.details.note) {
        doc.setFontSize(9);
        doc.text(`Catatan: ${data.details.note}`, 8, 140);
      }

      // Save
      const filename = `Label-${data.details.courier}-${data.receiver.name.replace(/\s+/g, '-')}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('PDF Generation failed', error);
      alert('Gagal membuat PDF label');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Input Changes
  const handleDetailsChange = (
    field: keyof typeof data.details,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      details: { ...prev.details, [field]: value },
    }));
  };

  const handleReceiverChange = (
    field: keyof typeof data.receiver,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      receiver: { ...prev.receiver, [field]: value },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* TOOL HEADER */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Printer className="w-6 h-6 text-blue-400" />
            Generator Label Resi Thermal
          </h1>
          <p className="text-gray-400 mt-1">
            Buat label pengiriman standar A6 (100x150mm) siap cetak. Gratis &
            tanpa batas.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setData({
                sender: { name: '', phone: '' },
                receiver: { name: '', phone: '', address: '' },
                details: { ...data.details, resi: '', note: '' },
              })
            }
            className="px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORM INPUT SECTION */}
        <div className="space-y-6">
          {/* SENDER CARD */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                  1
                </div>
                Data Pengirim
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={saveSender}
                  onChange={(e) => handleSaveSenderChange(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                />
                Simpan permanen
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Nama Toko/Pengirim
                </label>
                <input
                  type="text"
                  value={data.sender.name}
                  onChange={(e) => updateSender('name', e.target.value)}
                  placeholder="Contoh: Toko Berkah"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  No. HP
                </label>
                <input
                  type="tel"
                  value={data.sender.phone}
                  onChange={(e) => updateSender('phone', e.target.value)}
                  placeholder="08123456789"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* RECEIVER CARD */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                2
              </div>
              Data Penerima
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  value={data.receiver.name}
                  onChange={(e) => handleReceiverChange('name', e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  No. HP
                </label>
                <input
                  type="tel"
                  value={data.receiver.phone}
                  onChange={(e) =>
                    handleReceiverChange('phone', e.target.value)
                  }
                  placeholder="0812..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  value={data.receiver.address}
                  onChange={(e) =>
                    handleReceiverChange('address', e.target.value)
                  }
                  placeholder="Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* DETAILS CARD */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">
                3
              </div>
              Detail Paket
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Ekspedisi
                </label>
                <select
                  value={data.details.courier}
                  onChange={(e) =>
                    handleDetailsChange('courier', e.target.value)
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {COURIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  No. Resi/Booking (Opsional)
                </label>
                <input
                  type="text"
                  value={data.details.resi}
                  onChange={(e) => handleDetailsChange('resi', e.target.value)}
                  placeholder="Barcode akan muncul"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Berat (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={data.details.weight}
                  onChange={(e) =>
                    handleDetailsChange('weight', e.target.value)
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Catatan (Fragile/Isi Paket)
                </label>
                <input
                  type="text"
                  value={data.details.note}
                  onChange={(e) => handleDetailsChange('note', e.target.value)}
                  placeholder="Contoh: Barang Mudah Pecah, Jangan Dibanting"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW & ACTION SECTION */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* LIVE PREVIEW (Simple Represenation) */}
            <div className="bg-white rounded-lg p-4 shadow-lg aspect-[2/3] relative overflow-hidden flex flex-col text-black">
              <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <h2 className="text-2xl font-bold uppercase">
                  {data.details.courier}
                </h2>
                <span className="text-xs font-mono">{data.details.date}</span>
              </div>

              {data.details.resi && (
                <div className="h-16 bg-gray-100 mb-2 flex items-center justify-center border border-dashed border-gray-400">
                  <span className="font-mono text-sm tracking-widest">
                    {data.details.resi} (BARCODE)
                  </span>
                </div>
              )}

              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase text-gray-500">
                    Penerima
                  </div>
                  <div className="font-bold text-lg leading-tight">
                    {data.receiver.name || 'Nama Penerima'}
                  </div>
                  <div className="text-sm">
                    {data.receiver.phone || '08...'}
                  </div>
                  <div className="text-xs mt-1 leading-snug">
                    {data.receiver.address || 'Alamat lengkap...'}
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-2">
                  <div className="text-[10px] font-bold uppercase text-gray-500">
                    Pengirim
                  </div>
                  <div className="font-medium">
                    {data.sender.name || 'Nama Toko'}
                  </div>
                  <div className="text-xs">{data.sender.phone}</div>
                </div>
              </div>

              <div className="mt-auto pt-2 border-t-2 border-black">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold bg-black text-white px-2 py-1 inline-block">
                    {data.details.weight} kg
                  </div>
                  {data.details.note && (
                    <div className="text-[10px] font-bold italic truncate max-w-[70%]">
                      NOTE: {data.details.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Watermark preview */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-4xl font-black text-gray-100 pointer-events-none uppercase">
                Preview
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>Loading...</>
              ) : (
                <>
                  <Download className="w-5 h-5" /> Download Label (PDF A6)
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500">
              *Pastikan setting printer Anda ukuran A6 (100mm x 150mm)
            </p>

            {/* MONETIZATION / AFFILIATE Box */}
            <div className="glass-card p-4 border border-yellow-500/20 bg-yellow-500/5">
              <h4 className="flex items-center gap-2 font-semibold text-yellow-400 text-sm mb-3">
                <ShoppingBag className="w-4 h-4" /> Kebutuhan Seller
              </h4>
              <div className="space-y-3">
                <a
                  href="https://shopee.co.id/search?keyword=kertas%20thermal%20100x150"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group"
                >
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                      Kertas Thermal A6 Murah
                    </div>
                    <div className="text-xs text-gray-500">
                      Mulai Rp 15.000/roll
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>

                <a
                  href="https://shopee.co.id/search?keyword=printer%20thermal%20bluetooth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors group"
                >
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                      Printer Thermal Bluetooth
                    </div>
                    <div className="text-xs text-gray-500">
                      Cetak resi dari HP tanpa tinta
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
