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
