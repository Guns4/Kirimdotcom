import Fuse from 'fuse.js';
import { regions } from '@/data/indonesia-regions'; // Ensure this data exists

// Fallback data if regions file is missing or empty
const MOCK_DATA = [
    { name: 'Jakarta Selatan' }, { name: 'Jakarta Barat' }, { name: 'Jakarta Pusat' },
    { name: 'Jakarta Timur' }, { name: 'Jakarta Utara' }, { name: 'Bandung' },
    { name: 'Surabaya' }, { name: 'Semarang' }, { name: 'Medan' },
    { name: 'Makassar' }, { name: 'Denpasar' }, { name: 'Tangerang' },
    { name: 'Tangerang Selatan' }, { name: 'Depok' }, { name: 'Bekasi' },
    { name: 'Bogor' }
];

export function findBestMatch(keyword: string) {
    const data = regions && regions.length > 0 ? regions : MOCK_DATA;
    
    const options = {
        includeScore: true,
        threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
        keys: ['name']
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