# Affiliate Automation: Keyword Injector (PowerShell)

Write-Host "Initializing Keyword Injector..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. SQL Schema
Write-Host "1. Generating SQL Schema: affiliate_injector_schema.sql" -ForegroundColor Yellow

$sqlContent = @'
create table if not exists public.affiliate_keywords (
  id uuid default gen_random_uuid() primary key,
  keyword text not null unique, -- e.g. "sepatu"
  target_url text not null,     -- e.g. "https://shopee.co.id/..."
  category text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed Data (Example)
insert into public.affiliate_keywords (keyword, target_url, category)
values 
  ('sepatu', 'https://shope.ee/example-shoe', 'fashion'),
  ('baju', 'https://shope.ee/example-shirt', 'fashion'),
  ('hp', 'https://tokopedia.com/example-phone', 'electronics'),
  ('laptop', 'https://tokopedia.com/example-laptop', 'electronics'),
  ('tas', 'https://shope.ee/example-bag', 'fashion')
on conflict (keyword) do nothing;

alter table public.affiliate_keywords enable row level security;
create policy "Public read active keywords" on public.affiliate_keywords for select using (is_active = true);
'@

$sqlContent | Set-Content -Path "affiliate_injector_schema.sql" -Encoding UTF8
Write-Host "   [✓] SQL Schema created." -ForegroundColor Green

# 2. UI Component
Write-Host "2. Creating Component: src\components\affiliate\AffiliateLinkedText.tsx" -ForegroundColor Yellow
$dirComponent = "src\components\affiliate"
if (!(Test-Path $dirComponent)) { New-Item -ItemType Directory -Force -Path $dirComponent | Out-Null }

$componentContent = @'
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
'@

$componentContent | Set-Content -Path "src\components\affiliate\AffiliateLinkedText.tsx" -Encoding UTF8
Write-Host "   [✓] Component created." -ForegroundColor Green

# 3. Demo Page
Write-Host "3. Creating Demo Page: src\app\affiliate-demo\page.tsx" -ForegroundColor Yellow
$dirDemo = "src\app\affiliate-demo"
if (!(Test-Path $dirDemo)) { New-Item -ItemType Directory -Force -Path $dirDemo | Out-Null }

$demoContent = @'
import { AffiliateLinkedText } from '@/components/affiliate/AffiliateLinkedText';

export default function DemoPage() {
  const sample = "Paket berisi sepasang sepatu nike dan baju baru untuk lebaran, bonus tas cantik.";

  return (
    <div className="p-10">
       <h1 className="text-2xl font-bold mb-4">Affiliate Injector Demo</h1>
       <div className="border p-4 rounded-lg bg-card mb-4">
          <h2 className="text-gray-500 text-sm uppercase font-bold mb-2">Original Text</h2>
          <p>{sample}</p>
       </div>

       <div className="border p-4 rounded-lg bg-card">
          <h2 className="text-green-500 text-sm uppercase font-bold mb-2">Injected Text</h2>
          <p className="text-lg">
             <AffiliateLinkedText text={sample} />
          </p>
       </div>
       <p className="mt-4 text-xs text-muted-foreground">Note: Words 'sepatu', 'baju', 'tas' should be links.</p>
    </div>
  );
}
'@

$demoContent | Set-Content -Path "src\app\affiliate-demo\page.tsx" -Encoding UTF8
Write-Host "   [✓] Demo page created." -ForegroundColor Green

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Affiliate Injector Ready!" -ForegroundColor Green
Write-Host "1. Run 'affiliate_injector_schema.sql' in Supabase." -ForegroundColor White
Write-Host "2. Use <AffiliateLinkedText text={description} /> in your Tracking Results." -ForegroundColor White
Write-Host "3. Visit /affiliate-demo to test." -ForegroundColor White
