# Supabase Identity Security Setup

## 1. Enable Refresh Token Rotation (RTR)
Prevent Session Hijacking by forcing token rotation.

1. Go to **Supabase Dashboard** > **Authentication** > **Sessions**.
2. Enable **"Rotate Refresh Tokens"**.
3. Enable **"Detect Session Reuse"** (Critical for detecting theft).
4. Set **Access Token Expiry** to `600` seconds (10 Minutes).
5. Set **Refresh Token Expiry** to `86400` seconds (1 Day) or as needed.

## 2. Middleware Implementation
The project uses `@supabase/ssr` which handles token refreshing automatically in middleware.
Ensure `src/middleware.ts` calls `supabase.auth.getUser()`.

If reuse is detected, Supabase will revoke the session family automatically.
