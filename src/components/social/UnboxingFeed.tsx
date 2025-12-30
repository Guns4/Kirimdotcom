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
