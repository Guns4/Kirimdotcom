# Cross-Selling: Smart Recommendation Engine (PowerShell)

Write-Host "Initializing Recommendation Engine..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Configuration (The Brain)
Write-Host "1. Creating Rules: src\config\recommendation-rules.ts" -ForegroundColor Yellow
$dirConfig = "src\config"
if (!(Test-Path $dirConfig)) { New-Item -ItemType Directory -Force -Path $dirConfig | Out-Null }

$configContent = @'
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
'@
$configContent | Set-Content -Path "src\config\recommendation-rules.ts" -Encoding UTF8
Write-Host "   [?] Configuration created." -ForegroundColor Green

# 2. UI Component
Write-Host "2. Creating Widget: src\components\ads\SmartRecommendation.tsx" -ForegroundColor Yellow
$dirUI = "src\components\ads"
if (!(Test-Path $dirUI)) { New-Item -ItemType Directory -Force -Path $dirUI | Out-Null }

$widgetContent = @'
'use client';

import { useMemo } from 'react';
import { getRecommendations } from '@/config/recommendation-rules';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export function SmartRecommendation({ itemName }: { itemName: string }) {
  const recs = useMemo(() => getRecommendations(itemName), [itemName]);

  if (!recs || recs.length === 0) return null;

  return (
    <div className="space-y-4 my-6">
       <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Rekomendasi Untuk Anda
       </div>
       
       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {recs.map((item) => (
             <Card key={item.id} className="group overflow-hidden border hover:border-primary/50 transition-all flex flex-row sm:flex-col h-24 sm:h-auto">
                {/* Image Section */}
                <div className="w-24 sm:w-full sm:h-40 relative bg-muted flex-shrink-0">
                    <img 
                      src={item.productImage} 
                      alt={item.productTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                       {item.category}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-3 flex flex-col justify-between flex-1">
                   <div>
                       <h4 className="font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {item.productTitle}
                       </h4>
                       {item.priceDisplay && (
                           <p className="text-xs font-bold text-green-600">{item.priceDisplay}</p>
                       )}
                   </div>
                   
                   <div className="mt-2 text-right sm:text-left">
                       <Button size="sm" variant="outline" className="h-7 text-xs w-full justify-between group/btn" asChild>
                          <a href={item.link} target="_blank" rel="sponsored noopener noreferrer">
                             Beli Sekarang
                             <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </a>
                       </Button>
                   </div>
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
}
'@
$widgetContent | Set-Content -Path "src\components\ads\SmartRecommendation.tsx" -Encoding UTF8
Write-Host "   [?] UI components created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Recommendation Engine Ready!" -ForegroundColor Green
Write-Host "1. Rules defined in 'src/config/recommendation-rules.ts'." -ForegroundColor White
Write-Host "2. Use <SmartRecommendation itemName={tracking.goods_name} /> in your result page." -ForegroundColor White
