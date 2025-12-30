// ============================================
// INDONESIA POPULAR REGIONS DATA
// ============================================
// Optimized static data for most common shipping destinations
// Full data can be loaded from Supabase for complete coverage

export interface Region {
  id: string;
  district: string;
  city: string;
  cityType: 'Kota' | 'Kabupaten';
  province: string;
  postalCode?: string;
  binderId?: string; // ID for BinderByte API
}

// Major cities and their popular districts
export const popularRegions: Region[] = [
  // JAKARTA
  {
    id: 'jkt-001',
    district: 'Menteng',
    city: 'Jakarta Pusat',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '10310',
    binderId: '151',
  },
  {
    id: 'jkt-002',
    district: 'Gambir',
    city: 'Jakarta Pusat',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '10110',
    binderId: '151',
  },
  {
    id: 'jkt-003',
    district: 'Tanah Abang',
    city: 'Jakarta Pusat',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '10220',
    binderId: '151',
  },
  {
    id: 'jkt-004',
    district: 'Kemayoran',
    city: 'Jakarta Pusat',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '10610',
    binderId: '151',
  },
  {
    id: 'jkt-005',
    district: 'Kebayoran Baru',
    city: 'Jakarta Selatan',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '12110',
    binderId: '152',
  },
  {
    id: 'jkt-006',
    district: 'Tebet',
    city: 'Jakarta Selatan',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '12810',
    binderId: '152',
  },
  {
    id: 'jkt-007',
    district: 'Pancoran',
    city: 'Jakarta Selatan',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '12750',
    binderId: '152',
  },
  {
    id: 'jkt-008',
    district: 'Pasar Minggu',
    city: 'Jakarta Selatan',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '12510',
    binderId: '152',
  },
  {
    id: 'jkt-009',
    district: 'Kelapa Gading',
    city: 'Jakarta Utara',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '14240',
    binderId: '153',
  },
  {
    id: 'jkt-010',
    district: 'Tanjung Priok',
    city: 'Jakarta Utara',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '14310',
    binderId: '153',
  },
  {
    id: 'jkt-011',
    district: 'Cengkareng',
    city: 'Jakarta Barat',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '11710',
    binderId: '154',
  },
  {
    id: 'jkt-012',
    district: 'Grogol Petamburan',
    city: 'Jakarta Barat',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '11440',
    binderId: '154',
  },
  {
    id: 'jkt-013',
    district: 'Cakung',
    city: 'Jakarta Timur',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '13910',
    binderId: '155',
  },
  {
    id: 'jkt-014',
    district: 'Duren Sawit',
    city: 'Jakarta Timur',
    cityType: 'Kota',
    province: 'DKI Jakarta',
    postalCode: '13430',
    binderId: '155',
  },

  // BANDUNG
  {
    id: 'bdg-001',
    district: 'Coblong',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40132',
    binderId: '22',
  },
  {
    id: 'bdg-002',
    district: 'Cidadap',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40141',
    binderId: '22',
  },
  {
    id: 'bdg-003',
    district: 'Bojongloa Kidul',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40232',
    binderId: '22',
  },
  {
    id: 'bdg-004',
    district: 'Cibaduyut',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40239',
    binderId: '22',
  },
  {
    id: 'bdg-005',
    district: 'Lengkong',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40261',
    binderId: '22',
  },
  {
    id: 'bdg-006',
    district: 'Regol',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40251',
    binderId: '22',
  },
  {
    id: 'bdg-007',
    district: 'Sumur Bandung',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40111',
    binderId: '22',
  },
  {
    id: 'bdg-008',
    district: 'Cicendo',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40171',
    binderId: '22',
  },
  {
    id: 'bdg-009',
    district: 'Buahbatu',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40286',
    binderId: '22',
  },
  {
    id: 'bdg-010',
    district: 'Antapani',
    city: 'Bandung',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '40291',
    binderId: '22',
  },

  // SURABAYA
  {
    id: 'sby-001',
    district: 'Gubeng',
    city: 'Surabaya',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '60281',
    binderId: '444',
  },
  {
    id: 'sby-002',
    district: 'Tegalsari',
    city: 'Surabaya',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '60261',
    binderId: '444',
  },
  {
    id: 'sby-003',
    district: 'Wonokromo',
    city: 'Surabaya',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '60241',
    binderId: '444',
  },
  {
    id: 'sby-004',
    district: 'Genteng',
    city: 'Surabaya',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '60271',
    binderId: '444',
  },
  {
    id: 'sby-005',
    district: 'Sukolilo',
    city: 'Surabaya',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '60111',
    binderId: '444',
  },
  {
    id: 'sby-006',
    district: 'Rungkut',
    city: 'Surabaya',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '60293',
    binderId: '444',
  },
  {
    id: 'sby-007',
    district: 'Tenggilis Mejoyo',
    city: 'Surabaya',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '60292',
    binderId: '444',
  },
  {
    id: 'sby-008',
    district: 'Sawahan',
    city: 'Surabaya',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '60251',
    binderId: '444',
  },

  // SEMARANG
  {
    id: 'smg-001',
    district: 'Semarang Tengah',
    city: 'Semarang',
    cityType: 'Kota',
    province: 'Jawa Tengah',
    postalCode: '50131',
    binderId: '398',
  },
  {
    id: 'smg-002',
    district: 'Semarang Selatan',
    city: 'Semarang',
    cityType: 'Kota',
    province: 'Jawa Tengah',
    postalCode: '50241',
    binderId: '398',
  },
  {
    id: 'smg-003',
    district: 'Banyumanik',
    city: 'Semarang',
    cityType: 'Kota',
    province: 'Jawa Tengah',
    postalCode: '50263',
    binderId: '398',
  },
  {
    id: 'smg-004',
    district: 'Pedurungan',
    city: 'Semarang',
    cityType: 'Kota',
    province: 'Jawa Tengah',
    postalCode: '50192',
    binderId: '398',
  },
  {
    id: 'smg-005',
    district: 'Gajahmungkur',
    city: 'Semarang',
    cityType: 'Kota',
    province: 'Jawa Tengah',
    postalCode: '50231',
    binderId: '398',
  },

  // YOGYAKARTA
  {
    id: 'yog-001',
    district: 'Gondomanan',
    city: 'Yogyakarta',
    cityType: 'Kota',
    province: 'DI Yogyakarta',
    postalCode: '55122',
    binderId: '501',
  },
  {
    id: 'yog-002',
    district: 'Gedongtengen',
    city: 'Yogyakarta',
    cityType: 'Kota',
    province: 'DI Yogyakarta',
    postalCode: '55272',
    binderId: '501',
  },
  {
    id: 'yog-003',
    district: 'Kotagede',
    city: 'Yogyakarta',
    cityType: 'Kota',
    province: 'DI Yogyakarta',
    postalCode: '55171',
    binderId: '501',
  },
  {
    id: 'yog-004',
    district: 'Umbulharjo',
    city: 'Yogyakarta',
    cityType: 'Kota',
    province: 'DI Yogyakarta',
    postalCode: '55161',
    binderId: '501',
  },
  {
    id: 'yog-005',
    district: 'Depok',
    city: 'Sleman',
    cityType: 'Kabupaten',
    province: 'DI Yogyakarta',
    postalCode: '55281',
    binderId: '419',
  },

  // MEDAN
  {
    id: 'mdn-001',
    district: 'Medan Kota',
    city: 'Medan',
    cityType: 'Kota',
    province: 'Sumatera Utara',
    postalCode: '20212',
    binderId: '278',
  },
  {
    id: 'mdn-002',
    district: 'Medan Baru',
    city: 'Medan',
    cityType: 'Kota',
    province: 'Sumatera Utara',
    postalCode: '20152',
    binderId: '278',
  },
  {
    id: 'mdn-003',
    district: 'Medan Sunggal',
    city: 'Medan',
    cityType: 'Kota',
    province: 'Sumatera Utara',
    postalCode: '20122',
    binderId: '278',
  },
  {
    id: 'mdn-004',
    district: 'Medan Tuntungan',
    city: 'Medan',
    cityType: 'Kota',
    province: 'Sumatera Utara',
    postalCode: '20135',
    binderId: '278',
  },

  // MAKASSAR
  {
    id: 'mks-001',
    district: 'Makassar',
    city: 'Makassar',
    cityType: 'Kota',
    province: 'Sulawesi Selatan',
    postalCode: '90111',
    binderId: '255',
  },
  {
    id: 'mks-002',
    district: 'Panakkukang',
    city: 'Makassar',
    cityType: 'Kota',
    province: 'Sulawesi Selatan',
    postalCode: '90231',
    binderId: '255',
  },
  {
    id: 'mks-003',
    district: 'Tamalate',
    city: 'Makassar',
    cityType: 'Kota',
    province: 'Sulawesi Selatan',
    postalCode: '90221',
    binderId: '255',
  },
  {
    id: 'mks-004',
    district: 'Rappocini',
    city: 'Makassar',
    cityType: 'Kota',
    province: 'Sulawesi Selatan',
    postalCode: '90222',
    binderId: '255',
  },

  // DENPASAR / BALI
  {
    id: 'dps-001',
    district: 'Denpasar Selatan',
    city: 'Denpasar',
    cityType: 'Kota',
    province: 'Bali',
    postalCode: '80114',
    binderId: '114',
  },
  {
    id: 'dps-002',
    district: 'Denpasar Barat',
    city: 'Denpasar',
    cityType: 'Kota',
    province: 'Bali',
    postalCode: '80119',
    binderId: '114',
  },
  {
    id: 'dps-003',
    district: 'Kuta',
    city: 'Badung',
    cityType: 'Kabupaten',
    province: 'Bali',
    postalCode: '80361',
    binderId: '17',
  },
  {
    id: 'dps-004',
    district: 'Kuta Selatan',
    city: 'Badung',
    cityType: 'Kabupaten',
    province: 'Bali',
    postalCode: '80364',
    binderId: '17',
  },
  {
    id: 'dps-005',
    district: 'Ubud',
    city: 'Gianyar',
    cityType: 'Kabupaten',
    province: 'Bali',
    postalCode: '80571',
    binderId: '128',
  },

  // TANGERANG
  {
    id: 'tng-001',
    district: 'Tangerang',
    city: 'Tangerang',
    cityType: 'Kota',
    province: 'Banten',
    postalCode: '15111',
    binderId: '455',
  },
  {
    id: 'tng-002',
    district: 'Cipondoh',
    city: 'Tangerang',
    cityType: 'Kota',
    province: 'Banten',
    postalCode: '15148',
    binderId: '455',
  },
  {
    id: 'tng-003',
    district: 'Karawaci',
    city: 'Tangerang',
    cityType: 'Kota',
    province: 'Banten',
    postalCode: '15115',
    binderId: '455',
  },
  {
    id: 'tng-004',
    district: 'Serpong',
    city: 'Tangerang Selatan',
    cityType: 'Kota',
    province: 'Banten',
    postalCode: '15310',
    binderId: '456',
  },
  {
    id: 'tng-005',
    district: 'Pondok Aren',
    city: 'Tangerang Selatan',
    cityType: 'Kota',
    province: 'Banten',
    postalCode: '15224',
    binderId: '456',
  },
  {
    id: 'tng-006',
    district: 'Ciputat',
    city: 'Tangerang Selatan',
    cityType: 'Kota',
    province: 'Banten',
    postalCode: '15411',
    binderId: '456',
  },

  // BEKASI
  {
    id: 'bks-001',
    district: 'Bekasi Barat',
    city: 'Bekasi',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '17136',
    binderId: '54',
  },
  {
    id: 'bks-002',
    district: 'Bekasi Selatan',
    city: 'Bekasi',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '17146',
    binderId: '54',
  },
  {
    id: 'bks-003',
    district: 'Bekasi Timur',
    city: 'Bekasi',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '17111',
    binderId: '54',
  },
  {
    id: 'bks-004',
    district: 'Bekasi Utara',
    city: 'Bekasi',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '17121',
    binderId: '54',
  },
  {
    id: 'bks-005',
    district: 'Jatiasih',
    city: 'Bekasi',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '17423',
    binderId: '54',
  },

  // DEPOK
  {
    id: 'dpk-001',
    district: 'Beji',
    city: 'Depok',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '16421',
    binderId: '115',
  },
  {
    id: 'dpk-002',
    district: 'Cimanggis',
    city: 'Depok',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '16451',
    binderId: '115',
  },
  {
    id: 'dpk-003',
    district: 'Pancoran Mas',
    city: 'Depok',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '16431',
    binderId: '115',
  },
  {
    id: 'dpk-004',
    district: 'Sawangan',
    city: 'Depok',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '16511',
    binderId: '115',
  },

  // BOGOR
  {
    id: 'bgr-001',
    district: 'Bogor Tengah',
    city: 'Bogor',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '16121',
    binderId: '79',
  },
  {
    id: 'bgr-002',
    district: 'Bogor Selatan',
    city: 'Bogor',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '16132',
    binderId: '79',
  },
  {
    id: 'bgr-003',
    district: 'Bogor Barat',
    city: 'Bogor',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '16111',
    binderId: '79',
  },
  {
    id: 'bgr-004',
    district: 'Bogor Utara',
    city: 'Bogor',
    cityType: 'Kota',
    province: 'Jawa Barat',
    postalCode: '16152',
    binderId: '79',
  },

  // MALANG
  {
    id: 'mlg-001',
    district: 'Klojen',
    city: 'Malang',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '65111',
    binderId: '256',
  },
  {
    id: 'mlg-002',
    district: 'Blimbing',
    city: 'Malang',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '65126',
    binderId: '256',
  },
  {
    id: 'mlg-003',
    district: 'Lowokwaru',
    city: 'Malang',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '65141',
    binderId: '256',
  },
  {
    id: 'mlg-004',
    district: 'Sukun',
    city: 'Malang',
    cityType: 'Kota',
    province: 'Jawa Timur',
    postalCode: '65147',
    binderId: '256',
  },

  // PALEMBANG
  {
    id: 'plb-001',
    district: 'Ilir Timur I',
    city: 'Palembang',
    cityType: 'Kota',
    province: 'Sumatera Selatan',
    postalCode: '30113',
    binderId: '327',
  },
  {
    id: 'plb-002',
    district: 'Ilir Barat I',
    city: 'Palembang',
    cityType: 'Kota',
    province: 'Sumatera Selatan',
    postalCode: '30128',
    binderId: '327',
  },
  {
    id: 'plb-003',
    district: 'Seberang Ulu I',
    city: 'Palembang',
    cityType: 'Kota',
    province: 'Sumatera Selatan',
    postalCode: '30257',
    binderId: '327',
  },

  // BALIKPAPAN
  {
    id: 'bpp-001',
    district: 'Balikpapan Kota',
    city: 'Balikpapan',
    cityType: 'Kota',
    province: 'Kalimantan Timur',
    postalCode: '76111',
    binderId: '19',
  },
  {
    id: 'bpp-002',
    district: 'Balikpapan Selatan',
    city: 'Balikpapan',
    cityType: 'Kota',
    province: 'Kalimantan Timur',
    postalCode: '76114',
    binderId: '19',
  },
  {
    id: 'bpp-003',
    district: 'Balikpapan Utara',
    city: 'Balikpapan',
    cityType: 'Kota',
    province: 'Kalimantan Timur',
    postalCode: '76124',
    binderId: '19',
  },

  // PONTIANAK
  {
    id: 'ptk-001',
    district: 'Pontianak Kota',
    city: 'Pontianak',
    cityType: 'Kota',
    province: 'Kalimantan Barat',
    postalCode: '78111',
    binderId: '365',
  },
  {
    id: 'ptk-002',
    district: 'Pontianak Selatan',
    city: 'Pontianak',
    cityType: 'Kota',
    province: 'Kalimantan Barat',
    postalCode: '78116',
    binderId: '365',
  },

  // PEKANBARU
  {
    id: 'pbr-001',
    district: 'Pekanbaru Kota',
    city: 'Pekanbaru',
    cityType: 'Kota',
    province: 'Riau',
    postalCode: '28111',
    binderId: '350',
  },
  {
    id: 'pbr-002',
    district: 'Sukajadi',
    city: 'Pekanbaru',
    cityType: 'Kota',
    province: 'Riau',
    postalCode: '28121',
    binderId: '350',
  },

  // PADANG
  {
    id: 'pdg-001',
    district: 'Padang Barat',
    city: 'Padang',
    cityType: 'Kota',
    province: 'Sumatera Barat',
    postalCode: '25117',
    binderId: '318',
  },
  {
    id: 'pdg-002',
    district: 'Padang Timur',
    city: 'Padang',
    cityType: 'Kota',
    province: 'Sumatera Barat',
    postalCode: '25121',
    binderId: '318',
  },
];

// Search function for regions
export function searchRegions(query: string, limit: number = 20): Region[] {
  if (!query || query.length < 2) return [];

  const searchLower = query.toLowerCase();

  const results = popularRegions
    .filter((region) => {
      const fullText =
        `${region.district} ${region.city} ${region.province}`.toLowerCase();
      return (
        fullText.includes(searchLower) ||
        region.district.toLowerCase().includes(searchLower) ||
        region.city.toLowerCase().includes(searchLower) ||
        region.postalCode?.includes(query)
      );
    })
    .sort((a, b) => {
      // Prioritize exact district match
      const aExact = a.district.toLowerCase() === searchLower ? 0 : 1;
      const bExact = b.district.toLowerCase() === searchLower ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;

      // Then prioritize starts with
      const aStarts = a.district.toLowerCase().startsWith(searchLower) ? 0 : 1;
      const bStarts = b.district.toLowerCase().startsWith(searchLower) ? 0 : 1;
      return aStarts - bStarts;
    })
    .slice(0, limit);

  return results;
}

// Get display label for region
export function getRegionLabel(region: Region): string {
  return `${region.district}, ${region.cityType} ${region.city}, ${region.province}`;
}

// Get short label for region
export function getRegionShortLabel(region: Region): string {
  return `${region.district}, ${region.city}`;
}
