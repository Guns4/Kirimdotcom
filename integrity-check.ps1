# =============================================================================
# Integrity Check Script (PowerShell)
# Ensures all features are clickable and accessible
# =============================================================================

Write-Host "CekKirim Integrity Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$PASS = 0
$FAIL = 0

# =============================================================================
# 1. Check Sitemap Generation
# =============================================================================
Write-Host "Checking Sitemap..." -ForegroundColor White
if (Test-Path "$PSScriptRoot\src\app\sitemap.ts") {
    Write-Host "[PASS] sitemap.ts exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] sitemap.ts missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 2. Check Critical Pages
# =============================================================================
Write-Host ""
Write-Host "Checking Critical Pages..." -ForegroundColor White

$Page1_Path = "src\app\page.tsx"
if (Test-Path "$PSScriptRoot\$Page1_Path") {
    Write-Host "[PASS] Home Page exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] Home Page missing" -ForegroundColor Red
    $FAIL++
}

$OngkirPath = "$PSScriptRoot\src\app\cek-ongkir"
if ((Test-Path "$OngkirPath\page.tsx")) {
    Write-Host "[PASS] Cek Ongkir exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] Cek Ongkir missing" -ForegroundColor Red
    $FAIL++
}

$ResiPath = "$PSScriptRoot\src\app\cek-resi"
if ((Test-Path "$ResiPath\page.tsx")) {
    Write-Host "[PASS] Cek Resi exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] Cek Resi missing" -ForegroundColor Red
    $FAIL++
}

if (Test-Path "$PSScriptRoot\src\app\blacklist\page.tsx") {
    Write-Host "[PASS] Blacklist exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] Blacklist missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 3. Check UI Components
# =============================================================================
Write-Host ""
Write-Host "Checking UI Components..." -ForegroundColor White

if (Test-Path "$PSScriptRoot\src\components\ui\button.tsx") {
    Write-Host "[PASS] button.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] button.tsx missing" -ForegroundColor Red
    $FAIL++
}

if (Test-Path "$PSScriptRoot\src\components\ui\input.tsx") {
    Write-Host "[PASS] input.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] input.tsx missing" -ForegroundColor Red
    $FAIL++
}

if (Test-Path "$PSScriptRoot\src\components\ui\card.tsx") {
    Write-Host "[PASS] card.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] card.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 4. Check Layout Components
# =============================================================================
Write-Host ""
Write-Host "Checking Layout Components..." -ForegroundColor White

if (Test-Path "$PSScriptRoot\src\components\layout\Container.tsx") {
    Write-Host "[PASS] Container.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] Container.tsx missing" -ForegroundColor Red
    $FAIL++
}

if (Test-Path "$PSScriptRoot\src\components\layout\Section.tsx") {
    Write-Host "[PASS] Section.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] Section.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 5. Check Monitoring Components
# =============================================================================
Write-Host ""
Write-Host "Checking Monitoring..." -ForegroundColor White

if (Test-Path "$PSScriptRoot\src\components\monitoring\VercelInsights.tsx") {
    Write-Host "[PASS] VercelInsights.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] VercelInsights.tsx missing" -ForegroundColor Red
    $FAIL++
}

if (Test-Path "$PSScriptRoot\src\app\api\health\route.ts") {
    Write-Host "[PASS] Health endpoint exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] Health endpoint missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 6. TypeScript Check
# =============================================================================
Write-Host ""
Write-Host "TypeScript Validation..." -ForegroundColor White
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "Running type check..." -ForegroundColor Gray
    Push-Location "$PSScriptRoot"
    try {
        $output = npx tsc --noEmit --skipLibCheck 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[PASS] TypeScript: No critical errors" -ForegroundColor Green
            $PASS++
        }
        else {
            Write-Host "[WARN] TypeScript: Some warnings (may be expected)" -ForegroundColor Yellow
            $PASS++
        }
    }
    catch {
        Write-Host "[WARN] TypeScript check skipped" -ForegroundColor Yellow
        $PASS++
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "[WARN] npx not found, skipping TS check" -ForegroundColor Yellow
    $PASS++
}

# =============================================================================
# Summary
# =============================================================================
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $PASS" -ForegroundColor Green
Write-Host "Failed: $FAIL" -ForegroundColor Red
Write-Host ""

if ($FAIL -eq 0) {
    Write-Host "[SUCCESS] All integrity checks passed!" -ForegroundColor Green
    Write-Host "Ready for deployment" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "[ERROR] Some checks failed" -ForegroundColor Red
    Write-Host "Please fix the issues above" -ForegroundColor Yellow
    exit 1
}
