'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Debug Mode Component
 * Enables visual debugging for clickable areas
 *
 * Usage: Add ?debug=true to URL
 */
export function DebugMode() {
  const searchParams = useSearchParams();
  const isDebug = searchParams.get('debug') === 'true';

  useEffect(() => {
    if (isDebug) {
      document.body.classList.add('debug-mode');

      // Log all clickable elements
      const clickables = document.querySelectorAll(
        'button, a, [role="button"], [onclick]'
      );
      console.log(
        `🔍 Debug Mode: Found ${clickables.length} clickable elements`
      );

      clickables.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          console.warn(
            `⚠️ Small touch target #${i}:`,
            el,
            `${rect.width}x${rect.height}px`
          );
        }
      });

      // Check z-index conflicts
      const positioned = document.querySelectorAll('[style*="z-index"]');
      console.log(`📐 Positioned elements with z-index: ${positioned.length}`);

      return () => {
        document.body.classList.remove('debug-mode');
      };
    }
  }, [isDebug]);

  if (!isDebug) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-green-400 p-2 text-xs font-mono z-[99999]">
      <div>🐛 DEBUG MODE ACTIVE</div>
      <div>• Red outlines = Clickable areas</div>
      <div>• Min touch target: 44x44px</div>
      <div>• Check console for details</div>
    </div>
  );
}

export default DebugMode;
