import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient(cookieStore: ReturnType<typeof cookies>) {
  const resolvedCookies = await cookieStore;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return resolvedCookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            resolvedCookies.set({ name, value, ...options });
          } catch (error) {
            // Ignore - called from Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            resolvedCookies.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore - called from Server Component
          }
        },
      },
    }
  );
}
