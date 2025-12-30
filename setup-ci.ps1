# GitHub CI Build Safety Check (PowerShell)

Write-Host "Initializing Build Safety Pipeline..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Create Directory
$dir = ".github\workflows"
if (!(Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# 2. Create Workflow File
Write-Host "1. Creating Workflow: .github/workflows/build-check.yml" -ForegroundColor Yellow

$workflowContent = @'
name: Production Build Check

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build:
    name: Verify Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Build
        # WARNING: This requires environment variables to be set in GitHub Secrets!
        run: npm run build
        env:
          # Map these secrets in GitHub Repo Settings > Secrets and Variables > Actions
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
          # Add others as defined in your src/env.mjs
'@

$workflowContent | Set-Content -Path ".github\workflows\build-check.yml" -Encoding UTF8
Write-Host "   [?] Workflow created." -ForegroundColor Green

# 3. Create Guide
Write-Host "2. Creating Guide: CI_SETUP_GUIDE.md" -ForegroundColor Yellow

$guideContent = @'
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
'@

$guideContent | Set-Content -Path "CI_SETUP_GUIDE.md" -Encoding UTF8

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "CI Setup Complete!" -ForegroundColor Green
Write-Host "1. Push this file to GitHub." -ForegroundColor White
Write-Host "2. READ CI_SETUP_GUIDE.md and configure Secrets!" -ForegroundColor White
