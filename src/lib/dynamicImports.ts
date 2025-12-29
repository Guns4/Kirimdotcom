'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Loading skeleton for components
const LoadingSkeleton = () => (
    <div className= "w-full h-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse" >
    <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
        </div>
);

// ============================================================================
// Heavy Components (Lazy Loaded)
// ============================================================================

// Recharts (Charts) - ~200KB
export const DynamicAreaChart = dynamic(
    () => import('recharts').then((mod) => mod.AreaChart),
    {
        loading: () => <LoadingSkeleton />,
        ssr: false
    }
);

export const DynamicBarChart = dynamic(
    () => import('recharts').then((mod) => mod.BarChart),
    {
        loading: () => <LoadingSkeleton />,
        ssr: false
    }
);

// Maps (Leaflet/Google Maps) - ~150KB
export const DynamicMap = dynamic(
    () => import('@/components/maps/MapComponent'), // Example path
    {
        loading: () => <LoadingSkeleton />,
        ssr: false
    }
);

// PDF Viewer - ~500KB
export const DynamicPDFViewer = dynamic(
    () => import('@/components/pdf/PDFViewer'), // Example path
    {
        loading: () => <LoadingSkeleton />,
        ssr: false
    }
);

// 3D Models (Three.js) - ~1MB
export const DynamicModelViewer = dynamic(
    () => import('@/components/3d/ModelViewer'), // Example path
    {
        loading: () => <LoadingSkeleton />,
        ssr: false
    }
);

// Confetti - Animation library
export const DynamicConfetti = dynamic(
    () => import('react-confetti'),
    { ssr: false }
);

// Editor (Rich Text)
export const DynamicEditor = dynamic(
    () => import('@/components/editor/RichTextEditor'), // Example path
    {
        loading: () => <LoadingSkeleton />,
        ssr: false
    }
);
