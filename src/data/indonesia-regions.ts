export interface Region {
  name: string;
  slug: string;
  type: 'province' | 'city' | 'district';
  children?: Region[];
}

export const INDONESIA_REGIONS: Region[] = [
  {
    name: 'Jawa Barat',
    slug: 'jawa-barat',
    type: 'province',
    children: [
      {
        name: 'Bandung',
        slug: 'bandung',
        type: 'city',
        children: [
          { name: 'Cicendo', slug: 'cicendo', type: 'district' },
          { name: 'Coblong', slug: 'coblong', type: 'district' },
          { name: 'Andir', slug: 'andir', type: 'district' },
        ]
      },
      {
        name: 'Bekasi',
        slug: 'bekasi',
        type: 'city',
        children: [
          { name: 'Bekasi Barat', slug: 'bekasi-barat', type: 'district' },
          { name: 'Bekasi Timur', slug: 'bekasi-timur', type: 'district' },
        ]
      }
    ]
  },
  {
    name: 'DKI Jakarta',
    slug: 'dki-jakarta',
    type: 'province',
    children: [
      {
        name: 'Jakarta Selatan',
        slug: 'jakarta-selatan',
        type: 'city',
        children: [
          { name: 'Tebet', slug: 'tebet', type: 'district' },
          { name: 'Setiabudi', slug: 'setiabudi', type: 'district' },
        ]
      }
    ]
  }
];
