'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ThemeProviderProps {
  children: React.ReactNode;
  tenantSlug?: string | null;
}

export function ThemeProvider({ children, tenantSlug }: ThemeProviderProps) {
  useEffect(() => {
    if (!tenantSlug) {
      // Apply default theme
      applyDefaultTheme();
      return;
    }

    const loadTheme = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('tenants')
          .select('color_primary, color_secondary, font_family, logo_url')
          .eq('slug', tenantSlug)
          .single();

        if (error) {
          console.error('Failed to load tenant theme:', error);
          applyDefaultTheme();
          return;
        }

        if (data) {
          applyTheme(data);
        }
      } catch (error) {
        console.error('Theme loading error:', error);
        applyDefaultTheme();
      }
    };

    loadTheme();
  }, [tenantSlug]);

  return <>{children}</>;
}

interface TenantTheme {
  color_primary: string;
  color_secondary?: string;
  font_family?: string;
  logo_url?: string;
}

function applyTheme(theme: TenantTheme) {
  const root = document.documentElement;

  // Apply primary color with generated shades
  if (theme.color_primary) {
    const shades = generateColorShades(theme.color_primary);
    Object.entries(shades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
  }

  // Apply secondary color if provided
  if (theme.color_secondary) {
    root.style.setProperty('--color-secondary-500', theme.color_secondary);
  }

  // Apply font family if provided
  if (theme.font_family) {
    root.style.setProperty('--font-family-sans', theme.font_family);
  }
}

function applyDefaultTheme() {
  const root = document.documentElement;
  const defaultShades = generateColorShades('#0066CC');

  Object.entries(defaultShades).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });
}

/**
 * Generate color shades from a base hex color
 * Simple implementation - for production use a library like tinycolor2
 */
function generateColorShades(hex: string): Record<string, string> {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Generate shades (simplified - adjust lightness)
  const shades: Record<string, string> = {};

  shades['50'] = lighten(r, g, b, 0.95);
  shades['100'] = lighten(r, g, b, 0.85);
  shades['200'] = lighten(r, g, b, 0.65);
  shades['300'] = lighten(r, g, b, 0.45);
  shades['400'] = lighten(r, g, b, 0.25);
  shades['500'] = `#${hex}`; // Base color
  shades['600'] = darken(r, g, b, 0.15);
  shades['700'] = darken(r, g, b, 0.3);
  shades['800'] = darken(r, g, b, 0.45);
  shades['900'] = darken(r, g, b, 0.6);

  return shades;
}

function lighten(r: number, g: number, b: number, factor: number): string {
  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);
  return rgbToHex(newR, newG, newB);
}

function darken(r: number, g: number, b: number, factor: number): string {
  const newR = Math.round(r * (1 - factor));
  const newG = Math.round(g * (1 - factor));
  const newB = Math.round(b * (1 - factor));
  return rgbToHex(newR, newG, newB);
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * Hook to get current tenant config
 */
export function useTenantTheme(tenantSlug: string | null) {
  const [theme, setTheme] = useState<TenantTheme | null>(null);

  useEffect(() => {
    if (!tenantSlug) return;

    const loadTheme = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', tenantSlug)
        .single();

      if (data) {
        setTheme(data);
      }
    };

    loadTheme();
  }, [tenantSlug]);

  return theme;
}
