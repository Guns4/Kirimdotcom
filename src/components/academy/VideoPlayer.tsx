'use client';

import { Play } from 'lucide-react';

interface Props {
    videoId: string; // YouTube ID for now
    title: string;
}

export default function VideoPlayer({ videoId, title }: Props) {
    return (
        <div className="rounded-xl overflow-hidden shadow-lg bg-black aspect-video relative group">
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        </div>
    );
}
