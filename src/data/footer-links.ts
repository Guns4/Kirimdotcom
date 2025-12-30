import {
  Package,
  Truck,
  BookOpen,
  Calculator,
  MapPin,
  Grid,
  Shield,
  Camera,
  Mic,
} from 'lucide-react';

export const footerLinks = {
  popularRoutes: [
    {
      label: 'Jakarta - Bandung',
      origin: 'Jakarta',
      destination: 'Bandung',
      slug: 'jakarta-ke-bandung',
    },
    {
      label: 'Jakarta - Surabaya',
      origin: 'Jakarta',
      destination: 'Surabaya',
      slug: 'jakarta-ke-surabaya',
    },
    {
      label: 'Jakarta - Medan',
      origin: 'Jakarta',
      destination: 'Medan',
      slug: 'jakarta-ke-medan',
    },
    {
      label: 'Jakarta - Makassar',
      origin: 'Jakarta',
      destination: 'Makassar',
      slug: 'jakarta-ke-makassar',
    },
    {
      label: 'Bandung - Jakarta',
      origin: 'Bandung',
      destination: 'Jakarta',
      slug: 'bandung-ke-jakarta',
    },
    {
      label: 'Surabaya - Jakarta',
      origin: 'Surabaya',
      destination: 'Jakarta',
      slug: 'surabaya-ke-jakarta',
    },
    {
      label: 'Jakarta - Semarang',
      origin: 'Jakarta',
      destination: 'Semarang',
      slug: 'jakarta-ke-semarang',
    },
    {
      label: 'Jakarta - Jogja',
      origin: 'Jakarta',
      destination: 'Yogyakarta',
      slug: 'jakarta-ke-yogyakarta',
    },
    {
      label: 'Jakarta - Malang',
      origin: 'Jakarta',
      destination: 'Malang',
      slug: 'jakarta-ke-malang',
    },
    {
      label: 'Jakarta - Denpasar',
      origin: 'Jakarta',
      destination: 'Denpasar',
      slug: 'jakarta-ke-denpasar',
    },
  ],
  courierTracking: [
    {
      label: 'Cek Resi JNE',
      href: '/cek-resi/jne',
      title: 'Lacak paket JNE Reguler, YES, OKE',
    },
    {
      label: 'Cek Resi J&T',
      href: '/cek-resi/jnt',
      title: 'Tracking J&T Express otomatis',
    },
    {
      label: 'Cek Resi SiCepat',
      href: '/cek-resi/sicepat',
      title: 'Lacak resi SiCepat Halu, Gokil',
    },
    {
      label: 'Cek Resi AnterAja',
      href: '/cek-resi/anteraja',
      title: 'Tracking AnterAja Same Day',
    },
    {
      label: 'Cek Resi Shopee',
      href: '/cek-resi/shopee',
      title: 'Cek paket Shopee Express (SPX)',
    },
    {
      label: 'Cek Resi ID Express',
      href: '/cek-resi/idexpress',
      title: 'Lacak kiriman ID Express',
    },
    {
      label: 'Cek Resi Tiki',
      href: '/cek-resi/tiki',
      title: 'Tracking Tiki ONS, Reguler',
    },
    {
      label: 'Cek Resi Pos',
      href: '/cek-resi/pos',
      title: 'Lacak Pos Indonesia Kilat Khusus',
    },
  ],
  logisticsDictionary: [
    {
      label: 'Apa itu Manifest?',
      href: '/kamus/manifest',
      title: 'Arti status Manifest dalam pengiriman',
    },
    {
      label: 'Arti On Process',
      href: '/kamus/on-process',
      title: 'Maksud status On Process',
    },
    {
      label: 'Istilah Transit',
      href: '/kamus/transit',
      title: 'Pengertian Transit paket',
    },
    {
      label: 'Bad Address artinya',
      href: '/kamus/bad-address',
      title: 'Penjelasan status Bad Address',
    },
    {
      label: 'Received at Warehouse',
      href: '/kamus/received-at-warehouse',
      title: 'Arti status Received at Warehouse',
    },
  ],
  sellerTools: [
    {
      label: 'Cek Risiko COD',
      href: '/tools/cek-cod',
      icon: Shield,
      title: 'Cek riwayat pembeli COD bermasalah',
    },
    {
      label: 'Kompres Foto Produk',
      href: '/tools/kompres-foto',
      icon: Camera,
      title: 'Kecilkan ukuran foto produk otomatis',
    },
    {
      label: 'Bot Caption Jualan',
      href: '/tools/generator-caption',
      icon: Mic,
      title: 'Buat caption jualan dengan AI',
    },
    {
      label: 'Kalkulator Marketplace',
      href: '/tools/kalkulator-marketplace',
      icon: Calculator,
      title: 'Hitung keuntungan jualan di MP',
    },
    {
      label: 'Cek Resi Massal',
      href: '/bulk-tracking',
      icon: Grid,
      title: 'Lacak banyak resi sekaligus',
    },
  ],
};
