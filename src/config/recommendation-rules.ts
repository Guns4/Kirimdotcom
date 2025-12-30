export type RecommendationRule = {
  id: string;
  keywords: string[]; // Triggers
  productTitle: string;
  productImage: string;
  link: string; // Affiliate or Internal Link
  priceDisplay?: string;
  category: string;
};

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  // 1. Electronics Cross-Sell
  {
    id: 'rec-casing',
    keywords: ['hp', 'iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'smartphone', 'handphone'],
    productTitle: 'Casing & Tempered Glass Premium',
    productImage: 'https://images.unsplash.com/photo-1592899677712-a170135c8688?w=300&h=300&fit=crop', 
    link: 'https://shopee.co.id/search?keyword=casing%20hp', 
    priceDisplay: 'Mulai Rp 15.000',
    category: 'Electronics'
  },
  {
    id: 'rec-charger',
    keywords: ['hp', 'iphone', 'samsung', 'android', 'charger', 'kabel'],
    productTitle: 'Fast Charger 65W GaN',
    productImage: 'https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?w=300&h=300&fit=crop',
    link: 'https://tokopedia.com/search?q=charger%20gan', 
    priceDisplay: 'Diskon 30%',
    category: 'Electronics'
  },
  {
    id: 'rec-laundry',
    keywords: ['baju', 'kaos', 'kemeja', 'celana', 'rok', 'gamis', 'jilbab', 'pakaian', 'kain'],
    productTitle: 'Parfum Laundry Tahan Lama (1 Liter)',
    productImage: 'https://images.unsplash.com/photo-1600456899121-68eda5705257?w=300&h=300&fit=crop',
    link: 'https://shopee.co.id/search?keyword=parfum%20laundry',
    priceDisplay: 'Rp 25.000',
    category: 'Home Care'
  },
  {
    id: 'rec-general',
    keywords: ['paket', 'barang', 'dokumen'],
    productTitle: 'Lakban & Bubble Wrap Murah',
    productImage: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=300&h=300&fit=crop',
    link: 'https://shopee.co.id/search?keyword=bubble%20wrap',
    priceDisplay: 'Promo Bundle',
    category: 'Packing'
  }
];

export function getRecommendations(itemName: string): RecommendationRule[] {
  if (!itemName) return [];
  const lowerName = itemName.toLowerCase();
  
  // Find all matches
  const matches = RECOMMENDATION_RULES.filter(rule => 
     rule.keywords.some(k => lowerName.includes(k.toLowerCase()))
  );
  
  return matches;
}
