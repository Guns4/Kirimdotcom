import Fuse from 'fuse.js';

// Try to import regions from data file, fallback if missing
let regions: Array<{ name: string }> = [];
try {
  // We'll use require to avoid build errors if file doesn't exist yet
  // In a real app, this should be a proper import
  // const regionData = require('@/data/indonesia-regions');
  // regions = regionData.regions || [];
} catch (e) {
  // console.warn('Region data not found, using mocks');
}

// Fallback mock data
const MOCK_DATA = [
  { name: 'Jakarta Selatan' },
  { name: 'Jakarta Barat' },
  { name: 'Jakarta Pusat' },
  { name: 'Jakarta Timur' },
  { name: 'Jakarta Utara' },
  { name: 'Bandung' },
  { name: 'Surabaya' },
  { name: 'Semarang' },
  { name: 'Medan' },
  { name: 'Makassar' },
  { name: 'Denpasar' },
  { name: 'Tangerang' },
  { name: 'Tangerang Selatan' },
  { name: 'Depok' },
  { name: 'Bekasi' },
  { name: 'Bogor' },
  { name: 'Yogyakarta' },
  { name: 'Malang' },
  { name: 'Surakarta' },
  { name: 'Batam' },
  { name: 'Palembang' },
];

export function findBestMatch(keyword: string) {
  const data = regions.length > 0 ? regions : MOCK_DATA;

  const options = {
    includeScore: true,
    threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
    keys: ['name'],
  };

  const fuse = new Fuse(data, options);
  const result = fuse.search(keyword);

  // Return the top result if score is good (indicating a likely typo fix)
  // but not perfect (score 0 means exact match, we don't need to "fix" it)
  if (result.length > 0) {
    const top = result[0];
    // If score is close to 0 (exact), return null (no fix needed)
    // If score is between 0.1 and 0.4, it's a likely typo
    if (top.score && top.score > 0.01 && top.score < 0.4) {
      return top.item.name;
    }
  }

  return null;
}
