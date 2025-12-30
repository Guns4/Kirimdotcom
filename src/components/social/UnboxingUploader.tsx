'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { submitUnboxingReview } from '@/app/actions/unboxing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Video, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

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
            const fileName = `${resiNumber}-${user.id}-${Date.now()}.${fileExt}`;
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
                            <Video className="w-5 h-5" /> {file.name}
                        </div>
                    ) : (
                        <div className="text-muted-foreground">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm">Klik untuk pilih video (Max 30s)</p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-sm font-medium mb-1 block">Rating Ekspedisi</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(r => (
                            <Star
                                key={r}
                                className={`w-6 h-6 cursor-pointer ${r <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
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
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Kirim Video
                    </Button>
                </div>
            </div>
        </div>
    );
}
