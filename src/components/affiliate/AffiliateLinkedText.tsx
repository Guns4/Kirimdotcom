'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

// Simple cache to avoid refetching on every render
let KEYWORD_CACHE: { keyword: string; target_url: string }[] | null = null;

export function AffiliateLinkedText({ text, className }: { text: string; className?: string }) {
  const [keywords, setKeywords] = useState<{ keyword: string; target_url: string }[]>(KEYWORD_CACHE || []);

  useEffect(() => {
    if (KEYWORD_CACHE) return;

    async function load() {
       const supabase = createClient();
       const { data } = await supabase.from('affiliate_keywords').select('keyword, target_url').eq('is_active', true);
       if (data) {
           KEYWORD_CACHE = data;
           setKeywords(data);
       }
    }
    load();
  }, []);

  if (!text) return null;

  // Render logic securely
  // We split the text by keywords
  const processText = () => {
      let parts: (string | JSX.Element)[] = [text];

      keywords.forEach(({ keyword, target_url }) => {
          const regex = new RegExp(`(\\b${keyword}\\b)`, 'gi'); // Match whole word only
          
          const newParts: (string | JSX.Element)[] = [];
          
          parts.forEach(part => {
              if (typeof part !== 'string') {
                  newParts.push(part);
                  return;
              }

              // Split string by regex
              const split = part.split(regex);
              
              split.forEach((s, i) => {
                 // Even indices are regular text, odd are matches (captured group)
                 if (s.toLowerCase() === keyword.toLowerCase()) {
                     newParts.push(
                        <a 
                           key={`${keyword}-${i}`} 
                           href={target_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-500 hover:underline font-bold"
                           title={`Beli ${s} termurah`}
                        >
                           {s}
                        </a>
                     );
                 } else {
                     newParts.push(s);
                 }
              });
          });
          parts = newParts;
      });
      
      return <span className={className}>{parts}</span>;
  };

  return processText();
}
