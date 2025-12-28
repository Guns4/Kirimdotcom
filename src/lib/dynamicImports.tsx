/**
 * Web Vitals Optimization - Dynamic Imports
 * Lazy load heavy components for better LCP/FID
 */

import dynamic from 'next/dynamic';

// Loading skeleton for charts
const ChartSkeleton = () => (
    <div className= "w-full h-64 bg-surface-200 animate-pulse rounded-xl" />
);

// Loading skeleton for maps
const MapSkeleton = () => (
    <div className= "w-full h-96 bg-surface-200 animate-pulse rounded-xl flex items-center justify-center" >
    <span className="text-surface-500" > Loading map...</span>
        </div>
);

// Loading skeleton for PDF
const PDFSkeleton = () => (
    <div className= "w-full h-48 bg-surface-200 animate-pulse rounded-xl" />
);

/**
 * Dynamic Chart Components
 * Only loads Recharts when needed
 */
export const DynamicAreaChart = dynamic(
    () => import('recharts').then(mod => mod.AreaChart),
    { loading: () => <ChartSkeleton />, ssr: false }
);

export const DynamicBarChart = dynamic(
    () => import('recharts').then(mod => mod.BarChart),
    { loading: () => <ChartSkeleton />, ssr: false }
);

export const DynamicLineChart = dynamic(
    () => import('recharts').then(mod => mod.LineChart),
    { loading: () => <ChartSkeleton />, ssr: false }
);

export const DynamicPieChart = dynamic(
    () => import('recharts').then(mod => mod.PieChart),
    { loading: () => <ChartSkeleton />, ssr: false }
);

/**
 * Dynamic Map Component
 * Only loads Leaflet when needed
 */
export const DynamicMap = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { loading: () => <MapSkeleton />, ssr: false }
);

/**
 * Dynamic PDF Generator
 * Only loads react-pdf when needed
 */
export const DynamicPDFViewer = dynamic(
    () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
    { loading: () => <PDFSkeleton />, ssr: false }
);

/**
 * Dynamic Image Compressor
 * Only loads browser-image-compression when needed
 */
export const loadImageCompressor = () =>
    import('browser-image-compression').then(mod => mod.default);

/**
 * Dynamic QR Code Generator
 */
export const DynamicQRCode = dynamic(
    () => import('next-qrcode').then(mod => mod.useQRCode),
    { ssr: false }
);

/**
 * Dynamic Three.js (if used)
 */
export const DynamicThreeCanvas = dynamic(
    () => import('three').then(mod => mod),
    { ssr: false }
);

export default {
    DynamicAreaChart,
    DynamicBarChart,
    DynamicLineChart,
    DynamicPieChart,
    DynamicMap,
    DynamicPDFViewer,
    loadImageCompressor,
};
