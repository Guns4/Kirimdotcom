# Simple PowerShell Final Check for Phase 300
Write-Host "`n=== PHASE 300 FINAL CHECK ===" -ForegroundColor Magenta
Write-Host""

# 1. Check src/app structure
Write-Host "[1] Checking app structure..." -ForegroundColor Cyan
if (Test-Path "src\app") {
    $appDirs = (Get-ChildItem -Path "src\app" -Directory -Recurse).Count
    Write-Host "Found $appDirs directories in src\app" -ForegroundColor Green
}
else {
    Write-Host "Warning: src\app not found" -ForegroundColor Yellow
}

# 2. Check migrations
Write-Host "`n[2] Checking database migrations..." -ForegroundColor Cyan
if (Test-Path "src\utils\supabase\migrations") {
    $migrations = (Get-ChildItem -Path "src\utils\supabase\migrations" -Filter "*.sql").Count
    Write-Host "Found $migrations migration files" -ForegroundColor Green
}
else {
    Write-Host "Warning: No migrations directory" -ForegroundColor Yellow
}

# 3. Security check
Write-Host "`n[3] Security scan..." -ForegroundColor Cyan
$gitFiles = git ls-files 2>$null
if ($gitFiles -match "\.env$|\.env\.local$") {
    Write-Host "ERROR: .env files are tracked in git!" -ForegroundColor Red
}
else {
    Write-Host "OK: No .env files in git" -ForegroundColor Green
}

# 4. Stop long-running lint
Write-Host "`n[4] Stopping long-running processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Write-Host "Stopped node processes" -ForegroundColor Green

# 5. Run build
Write-Host "`n[5] Running production build..." -ForegroundColor Cyan
Write-Host "(This may take a few minutes...)`n"

if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

$buildResult = npm run build 2>&1
$buildExit = $LASTEXITCODE

if ($buildExit -eq 0) {
    Write-Host "`n=== BUILD SUCCESSFUL ===" -ForegroundColor Green
}
else {
    Write-Host "`n=== BUILD FAILED ===" -ForegroundColor Red
    Write-Host "Fix errors before pushing to GitHub" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n=== FINAL REPORT ===" -ForegroundColor Magenta
Write-Host "Ready for deployment!" -ForegroundColor Green
Write-Host "`nNext steps:"
Write-Host "1. git add ."
Write-Host "2. git commit -m 'chore: RELEASE PHASE 300 - THE LOGISTICS OS'"
Write-Host "3. git push origin main"
Write-Host ""
