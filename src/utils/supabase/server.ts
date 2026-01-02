import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import type { Database } from '@/types/database';

// Re-export for backward compatibility
export { createSupabaseServerClient as createServerClient };

export async function createClient() {
  // Dynamic import to avoid "next/headers" error in client components
  let cookieStore: any = null;

  try {
    const { cookies } = await import('next/headers');
    cookieStore = await cookies();
  } catch (error) {
    // Cookies not available - this can happen during static generation
    // or when called from client component context
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
