'use client';

import dynamic from 'next/dynamic';

const ImageCompressor = dynamic(
  () =>
    import('@/components/tools/ImageCompressor').then(
      (mod) => mod.ImageCompressor
    ),
  {
    loading: () => (
      <div className="text-white text-center py-20">Loading Compressor...</div>
    ),
    ssr: false,
  }
);

export default function ImageCompressorWrapper() {
  return <ImageCompressor />;
}
