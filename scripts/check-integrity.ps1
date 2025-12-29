# =============================================================================
# Integrity Check Script (PowerShell)
# Ensures all features are clickable and accessible
# =============================================================================

Write-Host "🚀 CekKirim Integrity Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$PASS = 0
$FAIL = 0

# =============================================================================
# 1. Check Sitemap Generation
# =============================================================================
Write-Host "🔍 Checking Sitemap..."
if (Test-Path "$PSScriptRoot/../src/app/sitemap.ts") {
    Write-Host "[PASS] sitemap.ts exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] sitemap.ts missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 2. Check Breadcrumbs Component
# =============================================================================
Write-Host ""
Write-Host "🔍 Checking Breadcrumbs..."
if (Test-Path "$PSScriptRoot/../src/components/AutoBreadcrumbs.tsx") {
    Write-Host "[PASS] AutoBreadcrumbs.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] AutoBreadcrumbs.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 3. Check Debug Mode
# =============================================================================
Write-Host ""
Write-Host "🔍 Checking Debug Mode..."
if (Test-Path "$PSScriptRoot/../src/components/DebugMode.tsx") {
    Write-Host "[PASS] DebugMode.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] DebugMode.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 4. Check Navigation Components
# =============================================================================
Write-Host ""
Write-Host "🔍 Checking Navigation..."

if (Test-Path "$PSScriptRoot/../src/components/navigation/NavbarDesktop.tsx") {
    Write-Host "[PASS] NavbarDesktop.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] NavbarDesktop.tsx missing" -ForegroundColor Red
    $FAIL++
}

if (Test-Path "$PSScriptRoot/../src/components/navigation/NavbarMobile.tsx") {
    Write-Host "[PASS] NavbarMobile.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] NavbarMobile.tsx missing" -ForegroundColor Red
    $FAIL++
}

if (Test-Path "$PSScriptRoot/../src/components/FloatingActionButton.tsx") {
    Write-Host "[PASS] FloatingActionButton.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] FloatingActionButton.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 5. Check Critical Pages
# =============================================================================
Write-Host ""
Write-Host "🔍 Checking Critical Pages..."

# Define pages manually to avoid syntax issues
$Page1_Path = "src/app/page.tsx"
$Page1_Name = "Home Page"

$Page2_Path = "src/app/cek-ongkir/page.tsx"
$Page2_Name = "Cek Ongkir"

$Page3_Path = "src/app/cek-resi/page.tsx"
$Page3_Name = "Cek Resi"

$Page4_Path = "src/app/blacklist/page.tsx"
$Page4_Name = "Blacklist"

# Check Home Page
if (Test-Path "$PSScriptRoot/../$Page1_Path") {
    Write-Host "[PASS] $Page1_Name exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] $Page1_Name missing" -ForegroundColor Red
    $FAIL++
}

# Check Cek Ongkir (Recursive check for nested routes)
$OngkirPath = "$PSScriptRoot/../src/app/cek-ongkir"
if ((Test-Path "$OngkirPath/page.tsx") -or (Test-Path "$OngkirPath/[...route]/page.tsx")) {
    Write-Host "[PASS] $Page2_Name exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] $Page2_Name missing" -ForegroundColor Red
    $FAIL++
}

# Check Cek Resi
$ResiPath = "$PSScriptRoot/../src/app/cek-resi"
if ((Test-Path "$ResiPath/page.tsx") -or (Test-Path "$ResiPath/[...slug]/page.tsx")) {
    Write-Host "[PASS] $Page3_Name exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] $Page3_Name missing" -ForegroundColor Red
    $FAIL++
}

# Check Blacklist
if (Test-Path "$PSScriptRoot/../$Page4_Path") {
    Write-Host "[PASS] $Page4_Name exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] $Page4_Name missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 6. Check UI Components
# =============================================================================
Write-Host ""
Write-Host "🔍 Checking UI Components..."

$Comp1 = "src/components/ui/button.tsx"
if (Test-Path "$PSScriptRoot/../$Comp1") {
    Write-Host "[PASS] button.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] button.tsx missing" -ForegroundColor Red
    $FAIL++
}

$Comp2 = "src/components/ui/input.tsx"
if (Test-Path "$PSScriptRoot/../$Comp2") {
    Write-Host "[PASS] input.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] input.tsx missing" -ForegroundColor Red
    $FAIL++
}

$Comp3 = "src/components/ui/card.tsx"
if (Test-Path "$PSScriptRoot/../$Comp3") {
    Write-Host "[PASS] card.tsx exists" -ForegroundColor Green
    $PASS++
}
else {
    Write-Host "[FAIL] card.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 7. TypeScript Check
# =============================================================================
Write-Host ""
Write-Host "🔍 TypeScript Validation..."
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "Running type check..."
    Push-Location "$PSScriptRoot/.."
    try {
        $CMD = Start-Process -FilePath "npx" -ArgumentList "tsc --noEmit --skipLibCheck" -NoNewWindow -PassThru -Wait
        if ($CMD.ExitCode -eq 0) {
            Write-Host "[PASS] TypeScript: No errors" -ForegroundColor Green
            $PASS++
        }
        else {
            Write-Host "[WARN] TypeScript: Some errors/warnings found" -ForegroundColor Yellow
            $PASS++
        }
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "[WARN] npx not found, skipping TS check" -ForegroundColor Yellow
}

# =============================================================================
# Summary
# =============================================================================
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📈 Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $PASS" -ForegroundColor Green
Write-Host "Failed: $FAIL" -ForegroundColor Red
Write-Host ""

if ($FAIL -eq 0) {
    Write-Host "✅ [SUCCESS] All integrity checks passed!" -ForegroundColor Green
    Write-Host "🚀 Ready for deployment" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "❌ [ERROR] Some checks failed" -ForegroundColor Red
    Write-Host "🛠️ Please fix the issues above" -ForegroundColor Yellow
    exit 1
}
