# GitHub CI Setup Guide

## Critical: Environment Variables
Your project uses `env.mjs` or requires `NEXT_PUBLIC_` variables during build. 
If you simply push the workflow, **it will fail** because GitHub Actions doesn't have your `.env` file.

## Action Required
1. Go to your GitHub Repository.
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add the following (copy from your local `.env`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - (And any other variable required in `src/env.mjs`)

## Testing
1. Push this code to GitHub.
2. Go to the **Actions** tab in GitHub.
3. You should see "Production Build Check" running.
