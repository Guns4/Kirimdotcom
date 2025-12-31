#!/bin/bash

# setup-token-rotation.sh
# -----------------------
# Enhanced Guide & Config for Supabase Auth Token Rotation (RTR)
# Includes Middleware Logic for Session Hijacking Detection

echo "🔐 Setting up Identity Security (RTR) & Middleware..."

# 1. Output Instructions
cat > SUPABASE_SECURITY_GUIDE.md << 'EOF'
# Supabase Identity Security Setup (Enhanced)

## 1. Enable Refresh Token Rotation (RTR)
Prevent Session Hijacking by forcing token rotation.

1. Go to **Supabase Dashboard** > **Authentication** > **Sessions**.
2. Enable **"Rotate Refresh Tokens"**.
3. Enable **"Detect Session Reuse"** (Critical).
4. **IMPORTANT:** Set Access Token Expiry to **900 seconds (15 Minutes)** per requirements.

## 2. Client-Side Config (src/lib/supabase/client.ts)
Ensure your `createHashClient` or `createBrowserClient` options include:
```ts
auth: {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true
}
```

## 3. Middleware Implementation (src/middleware.ts)
We have generated a secure middleware logic snippet in `src/lib/auth/middleware-security.ts`.
Please integrate it into your main middleware file.

The logic checks:
- Validation of Session
- Detection of potential reuse (usually handled by Supabase throwing error on exchange)
- Redirect to login on security error
EOF

# 2. Generate Middleware Logic Snippet
mkdir -p src/lib/auth

cat > src/lib/auth/middleware-security.ts << 'EOF'
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.delete(name); // Fix delete method
        },
      },
    }
  );

  // 1. Get User (Triggers Token Refresh if needed)
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
     // If token refresh fails (e.g. Reuse Detected), error will be thrown here or user will be null
     // Log the security event
     console.warn('[SECURITY] Session Verification Failed:', error.message);
     
     // 2. Redirect to Login if accessing protected route
     if (!request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/login?error=session_expired', request.url));
     }
  }

  return response;
}
EOF

echo "✅ generated SUPABASE_SECURITY_GUIDE.md"
echo "✅ generated middleware snippet: src/lib/auth/middleware-security.ts"
