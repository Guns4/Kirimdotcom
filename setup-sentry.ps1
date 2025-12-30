# Sentry Error Tracking Setup (PowerShell)

Write-Host "Initializing Sentry Setup..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Create Debug Page for Testing
Write-Host "1. Creating Debug Page: src/app/debug-sentry/page.tsx" -ForegroundColor Yellow

$dir = "src\app\debug-sentry"
if (!(Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$pageContent = @'
'use client';

import { useState } from 'react';

export default function SentryDebugPage() {
  const [error, setError] = useState(false);

  if (error) {
    throw new Error('This is a simulated Sentry Test Error from CekKirim!');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6">
      <h1 className="text-2xl font-bold">Sentry Integration Debugger</h1>
      <p className="max-w-md text-center text-gray-400">
        Clicking the button below will crash this React Component intentionally.
        Check your Sentry Dashboard to see the report.
      </p>
      
      <button
        onClick={() => setError(true)}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
      >
        ⚠️ Trigger Crash
      </button>
    </div>
  );
}
'@

$pageContent | Set-Content -Path "src\app\debug-sentry\page.tsx" -Encoding UTF8

# 2. Guide Generation
Write-Host "2. Generating Sentry Guide: SENTRY_SETUP_GUIDE.md" -ForegroundColor Yellow

$guideContent = @'
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
'@

$guideContent | Set-Content -Path "SENTRY_SETUP_GUIDE.md" -Encoding UTF8

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "1. READ 'SENTRY_SETUP_GUIDE.md'." -ForegroundColor White
Write-Host "2. Run the wizard command to link your account." -ForegroundColor White
Write-Host "3. Test using '/debug-sentry'." -ForegroundColor White
