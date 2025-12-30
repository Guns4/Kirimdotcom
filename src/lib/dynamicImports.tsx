/**
 * Dynamic Imports for Performance Optimization
 * Lazy load heavy components to reduce initial bundle size
 */

import dynamic from 'next/dynamic';

/**
 * Charts - Recharts (heavy library ~200KB)
 * Only include if recharts is installed: npm install recharts
 */
export const DynamicAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Loading chart...</span>
      </div>
    ),
  }
);

export const DynamicLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

export const DynamicBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

export const DynamicPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

/**
 * Maps - Leaflet (heavy library ~150KB)
 */
export const DynamicLeafletMap = dynamic(
  () => import('@/components/tracking/TrackingMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-gray-600">Loading map...</span>
        </div>
      </div>
    ),
  }
);

/**
 * Example: How to add more dynamic imports when you need them
 *
 * // For QR Code (install: npm install react-qr-code)
 * export const DynamicQRCode = dynamic(() => import('react-qr-code'), {
 *     ssr: false,
 *     loading: () => <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg" />
 * });
 *
 * // For PDF Viewer (install: npm install react-pdf)
 * export const DynamicPDFViewer = dynamic(() => import('@/components/PDFViewer'), {
 *     ssr: false,
 *     loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg" />
 * });
 */

/**
 * Utility: Create dynamic import with custom loading
 */
export function createDynamicImport<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  options?: {
    loading?: () => React.ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    ssr: options?.ssr ?? false,
    loading: options?.loading,
  });
}
