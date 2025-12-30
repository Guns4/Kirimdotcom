# Sentry Setup Guide

## Step 1: Automated Configuration
We recommend using the official Wizard to configure your Next.js config automatically.
Run the following command in your terminal:

```bash
npx @sentry/wizard@latest -i nextjs
```

1. It will ask to open your browser -> **Login/Signup** to Sentry.io.
2. Select your project (or create a new one).
3. The wizard will automatically:
   - Create `sentry.client.config.ts`
   - Create `sentry.server.config.ts`
   - Create `sentry.edge.config.ts`
   - Update `next.config.mjs` (or .js)
   - Create `.env.sentry-build-plugin`

## Step 2: DSN Key (If Manual)
If you need the DSN key manually:
1. Go to [sentry.io](https://sentry.io/).
2. Navigate to **Settings** > **Projects** > [Your Project] > **Client Keys (DSN)**.
3. Copy the DSN URL.

## Step 3: Verify
1. Run your dev server: `npm run dev`
2. Visit: `http://localhost:3000/debug-sentry`
3. Click **"Trigger Crash"**.
4. Check your Sentry Dashboard issues stream.
