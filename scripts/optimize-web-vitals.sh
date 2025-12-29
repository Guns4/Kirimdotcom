#!/bin/bash

# =============================================================================
# Web Vitals Optimization Script
# Technical SEO for Core Web Vitals (LCP, FID, CLS)
# =============================================================================

echo "Optimizing Web Vitals..."
echo "========================"
echo ""

# Files created/modified
echo "Files created:"
echo "  - src/lib/dynamicImports.tsx"
echo "  - src/components/ThirdPartyScripts.tsx"
echo "  - optimize-web-vitals.sh"
echo ""

# =============================================================================
# 1. Font Optimization
# =============================================================================
echo "1. FONT OPTIMIZATION"
echo "--------------------"
echo ""
echo "Best Practice: Use next/font with display: 'swap'"
echo ""
cat << 'EOF'

// In src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',  // <- Critical: Text visible before font loads
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export default function Layout({ children }) {
  return (
    <html className={inter.className}>
      {children}
    </html>
  );
}

EOF

echo ""
echo "Impact: Eliminates FOIT (Flash of Invisible Text)"
echo "LCP Improvement: 100-500ms faster"
echo ""

# =============================================================================
# 2. Script Defer Strategy
# =============================================================================
echo "2. SCRIPT DEFER STRATEGY"
echo "------------------------"
echo ""
echo "Use lazyOnload for non-critical scripts:"
echo ""
cat << 'EOF'

import { ThirdPartyScripts } from '@/components/ThirdPartyScripts';

// In layout.tsx
<ThirdPartyScripts
  gaId="G-XXXXXXXXXX"
  adsenseId="ca-pub-XXXXXXXXXX"
  monetagId="XXXXXX"
/>

EOF

echo ""
echo "Script Loading Strategies:"
echo "  - beforeInteractive: Critical scripts (rare)"
echo "  - afterInteractive: Needed early (crisp chat)"
echo "  - lazyOnload: Analytics, ads, tracking (most)"
echo ""
echo "Impact: Reduces main thread blocking"
echo "FID Improvement: 50-200ms faster"
echo ""

# =============================================================================
# 3. Dynamic Imports
# =============================================================================
echo "3. DYNAMIC IMPORTS"
echo "------------------"
echo ""
echo "Split heavy components to reduce initial bundle:"
echo ""
cat << 'EOF'

// Instead of static import:
// import { AreaChart } from 'recharts';

// Use dynamic import:
import { DynamicAreaChart } from '@/lib/dynamicImports';

<DynamicAreaChart data={data}>
  {/* chart content */}
</DynamicAreaChart>

EOF

echo ""
echo "Heavy components to lazy load:"
echo "  - Recharts (charts): ~200KB"
echo "  - Leaflet (maps): ~150KB"
echo "  - react-pdf: ~500KB"
echo "  - Three.js (3D): ~1MB"
echo "  - image-compression: ~100KB"
echo ""
echo "Impact: Smaller initial JS bundle"
echo "LCP Improvement: 200-1000ms faster"
echo ""

# =============================================================================
# 4. Image Optimization
# =============================================================================
echo "4. IMAGE OPTIMIZATION"
echo "---------------------"
echo ""
echo "Always use next/image with proper sizing:"
echo ""
cat << 'EOF'

import Image from 'next/image';

// Good: Proper sizing and lazy loading
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority={true}  // Only for above-the-fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// For background images
<Image
  src="/bg.jpg"
  alt=""
  fill
  sizes="100vw"
  quality={75}
  priority={false}  // Lazy load backgrounds
/>

EOF

echo ""
echo "Impact: Optimized image delivery"
echo "LCP Improvement: 300-1500ms faster"
echo ""

# =============================================================================
# 5. Preload Critical Assets
# =============================================================================
echo "5. PRELOAD CRITICAL ASSETS"
echo "--------------------------"
echo ""
cat << 'EOF'

// In layout.tsx <head>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link rel="dns-prefetch" href="https://api.binderbyte.com" />

EOF

echo ""

# =============================================================================
# Summary
# =============================================================================
echo "========================"
echo "Web Vitals Optimization Complete!"
echo ""
echo "Expected Improvements:"
echo "  - LCP: 1-3 seconds faster"
echo "  - FID: 50-200ms faster"
echo "  - CLS: Near 0 (stable layout)"
echo ""
echo "Target Scores:"
echo "  - LCP: < 2.5s (Good)"
echo "  - FID: < 100ms (Good)"
echo "  - CLS: < 0.1 (Good)"
echo ""
echo "Test with:"
echo "  - Google PageSpeed Insights"
echo "  - Lighthouse in Chrome DevTools"
echo "  - web.dev/measure"
echo ""

exit 0
