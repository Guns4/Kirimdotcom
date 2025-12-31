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
