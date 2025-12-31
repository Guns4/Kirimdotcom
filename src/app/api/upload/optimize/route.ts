import { NextResponse } from 'next/server';
import { optimizeImage } from '@/lib/media/image-optimizer';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Read Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Optimize
        const optimizedBuffer = await optimizeImage(buffer);

        // 3. Upload to Supabase Storage (Example bucket: 'uploads')
        const supabase = createClient();
        const filename = `${Date.now()}-${file.name.split('.')[0]}.webp`;

        const { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(filename, optimizedBuffer, {
                contentType: 'image/webp',
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // 4. Return URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('uploads')
            .getPublicUrl(filename);

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (e: any) {
        console.error('Upload failed', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
