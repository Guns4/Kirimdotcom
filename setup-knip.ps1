# Dead Code Analysis Setup (PowerShell)

Write-Host "Initializing Dead Code Audit..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Install Knip
Write-Host "1. Installing Knip..." -ForegroundColor Yellow
npm install --save-dev knip typescript

# 2. Configure Knip for Next.js App Router
Write-Host "2. Generating knip.json configuration..." -ForegroundColor Yellow
$knipConfig = @'
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "next.config.{js,ts,mjs}",
    "src/middleware.ts",
    "src/app/**/{page,layout,loading,error,not-found,global-error,route,template,default}.{ts,tsx}",
    "src/instrumentation.ts"
  ],
  "project": ["src/**/*.{ts,tsx,js,jsx}"],
  "ignore": ["**/*.d.ts"],
  "ignoreDependencies": [
    "eslint-config-next",
    "postcss",
    "autoprefixer",
    "tailwindcss",
    "sharp",
    "@types/*",
    "husky",
    "lint-staged",
    "prettier",
    "@vercel/*",
    "lucide-react"
  ]
}
'@

$knipConfig | Set-Content -Path "knip.json" -Encoding UTF8

# 3. Run Scan
Write-Host "3. Scanning for dead code..." -ForegroundColor Yellow
Write-Host "   NOTE: This tool is strict. Verify results before deleting." -ForegroundColor Gray
Write-Host "   Output also saved to DEAD_CODE_REPORT.txt" -ForegroundColor Gray

# Using Tee-Object for PowerShell equivalent of tee
npx knip --no-exit-code | Tee-Object -FilePath "DEAD_CODE_REPORT.txt"

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Audit Complete!" -ForegroundColor Green
Write-Host "Check DEAD_CODE_REPORT.txt for the full list." -ForegroundColor White
