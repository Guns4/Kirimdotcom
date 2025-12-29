#!/bin/bash

# =============================================================================
# Social Viral Feature (Unboxing Video Reviews)
# =============================================================================

echo "Initializing Social Features..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL Schema: unboxing_reviews_schema.sql"
cat <<EOF > unboxing_reviews_schema.sql
-- Table: unboxing_reviews
create table if not exists public.unboxing_reviews (
  id uuid default gen_random_uuid() primary key,
  resi_number text not null,
  video_url text not null,
  thumbnail_url text, -- Optional, can store first frame if processed
  rating integer check (rating >= 1 and rating <= 5),
  review_text text,
  user_id uuid references auth.users(id) on delete set null,
  is_approved boolean default false, -- Moderation queue
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.unboxing_reviews enable row level security;

-- Policy: Everyone can view approved videos
create policy "Public can view approved reviews"
  on public.unboxing_reviews for select
  using (is_approved = true);

-- Policy: Authenticated users can insert
create policy "Users can upload reviews"
  on public.unboxing_reviews for insert
  with check (auth.uid() = user_id);

-- Storage Bucket Instructions (Run in SQL Editor if possible, otherwise UI)
-- insert into storage.buckets (id, name, public) values ('unboxing-videos', 'unboxing-videos', true);
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'unboxing-videos' );
-- create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'unboxing-videos' and auth.role() = 'authenticated' );
EOF

# 2. Server Actions
echo "2. Creating Server Actions: src/app/actions/unboxing.ts"
mkdir -p src/app/actions
cat <<EOF > src/app/actions/unboxing.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitUnboxingReview(data: {
  resi_number: string;
  video_url: string;
  rating: number;
  review_text: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase.from('unboxing_reviews').insert({
    resi_number: data.resi_number,
    video_url: data.video_url,
    rating: data.rating,
    review_text: data.review_text,
    user_id: user.id,
    is_approved: true, // Auto-approve for demo, change to false for prod
  });

  if (error) {
    console.error('Submit review error:', error);
    return { error: 'Gagal menyimpan review.' };
  }

  revalidatePath('/cek-resi');
  return { success: true };
}

export async function getRelatedVideos(resi_number: string) {
  const supabase = createClient();
  
  // Logic: Get videos for this courier or just recent approved videos
  const { data } = await supabase
    .from('unboxing_reviews')
    .select('*, profiles(full_name, avatar_url)') // Assuming profiles relation
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(6);
    
  return data || [];
}
EOF

# 3. UI Components
echo "3. Creating UI Components in src/components/social..."
mkdir -p src/components/social

# Uploader Component
cat <<EOF > src/components/social/UnboxingUploader.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { submitUnboxingReview } from '@/app/actions/unboxing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Video, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner'; // Assuming sonner or similar toast lib

interface UnboxingUploaderProps {
  resiNumber: string;
}

export function UnboxingUploader({ resiNumber }: UnboxingUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        toast.error('Silakan login terlebih dahulu');
        setIsUploading(false);
        return;
    }

    try {
      // 1. Upload Video
      const fileExt = file.name.split('.').pop();
      const fileName = \`\${resiNumber}-\${user.id}-\${Date.now()}.\${fileExt}\`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('unboxing-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const videoUrl = supabase.storage
        .from('unboxing-videos')
        .getPublicUrl(fileName).data.publicUrl;

      // 2. Submit Data
      const res = await submitUnboxingReview({
        resi_number: resiNumber,
        video_url: videoUrl,
        rating,
        review_text: text
      });

      if (res.error) throw new Error(res.error);

      toast.success('Video berhasil diupload! Poin telah ditambahkan.');
      setIsOpen(false);
      setFile(null);
      setText('');
      
    } catch (err: any) {
      toast.error('Gagal upload: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white shadow-lg overflow-hidden relative group cursor-pointer" onClick={() => setIsOpen(true)}>
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Video size={100} />
         </div>
         <h3 className="text-xl font-bold mb-2">Punya Video Unboxing?</h3>
         <p className="text-pink-100 mb-4 text-sm max-w-[80%]">Upload video paketmu sampai & dapatkan <span className="font-bold text-yellow-300">500 Poin</span> langsung!</p>
         <Button variant="secondary" size="sm" className="w-full sm:w-auto shadow-xl">
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
         </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card animate-in fade-in zoom-in-95">
       <h3 className="font-bold text-lg mb-4">Upload Unboxing</h3>
       
       <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
             <input 
                type="file" 
                accept="video/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
             />
             {file ? (
                <div className="text-green-600 font-medium flex items-center justify-center gap-2">
                   <Video className="w-5 h-5"/> {file.name}
                </div>
             ) : (
                <div className="text-muted-foreground">
                   <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50"/>
                   <p className="text-sm">Klik untuk pilih video (Max 30s)</p>
                </div>
             )}
          </div>

          <div>
             <label className="text-sm font-medium mb-1 block">Rating Ekspedisi</label>
             <div className="flex gap-1">
                {[1,2,3,4,5].map(r => (
                   <Star 
                     key={r} 
                     className={\`w-6 h-6 cursor-pointer \${r <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}\`}
                     onClick={() => setRating(r)}
                   />
                ))}
             </div>
          </div>

          <Textarea 
            placeholder="Ceritakan pengalamanmu..." 
            value={text} 
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex gap-2 justify-end">
             <Button variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
             <Button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                Kirim Video
             </Button>
          </div>
       </div>
    </div>
  );
}
EOF

# Feed Component
cat <<EOF > src/components/social/UnboxingFeed.tsx
import { getRelatedVideos } from '@/app/actions/unboxing';
import { Play } from 'lucide-react';

export async function UnboxingFeed({ resiNumber }: { resiNumber: string }) {
  const videos = await getRelatedVideos(resiNumber);

  if (!videos || videos.length === 0) return null;

  return (
    <div className="space-y-4">
       <h3 className="font-bold text-lg flex items-center gap-2">
          <Play className="w-5 h-5 fill-red-500 text-red-500" />
          Video Unboxing Terkait
       </h3>
       
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map((vid: any) => (
             <div key={vid.id} className="group relative aspect-[9/16] bg-black rounded-xl overflow-hidden cursor-pointer">
                <video 
                   src={vid.video_url} 
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                   muted
                   loop
                   onMouseOver={(e) => e.currentTarget.play()}
                   onMouseOut={(e) => e.currentTarget.pause()}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-8 h-8 text-white/80 fill-white/80 group-hover:hidden" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
                   <p className="font-bold truncate">{vid.resi_number}</p>
                   <p className="opacity-80 truncate">{vid.review_text || 'No review'}</p>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
EOF

echo ""
echo "================================================="
echo "Social Video Feature Ready!"
echo "1. Run 'unboxing_reviews_schema.sql' in Supabase SQL Editor."
echo "2. Create a bucket named 'unboxing-videos' (Public) in Supabase Storage."
echo "3. Import <UnboxingUploader /> and <UnboxingFeed /> in your tracking page."
