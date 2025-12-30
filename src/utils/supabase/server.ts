import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Re-export for backward compatibility
export { createSupabaseServerClient as createServerClient };

export async function createClient() {
  // Try to get cookieStore - may fail during static generation or when no request context
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;

  try {
    cookieStore = await cookies();
  } catch (error) {
    // Cookies not available - this can happen during static generation
    // Return a client with empty cookie handlers
    console.warn(
      'createClient: cookies() not available, using anonymous client'
    );
  }

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore?.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore?.set({ name, value, ...options });
          } catch (_error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore?.set({ name, value: '', ...options });
          } catch (_error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
