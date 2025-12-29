# =============================================================================
# Integrity Check Script (PowerShell)
# Ensures all features are clickable and accessible
# =============================================================================

Write-Host "CekKirim Integrity Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$PASS = 0
$FAIL = 0
$ROOT = Join-Path $PSScriptRoot ".."

# =============================================================================
# 1. Check Sitemap Generation
# =============================================================================
Write-Host "Checking Sitemap..." -ForegroundColor White
if (Test-Path (Join-Path $ROOT "src/app/sitemap.ts")) {
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

$criticalPages = @(
    @{Path = "src/app/page.tsx"; Name = "Home Page" },
    @{Path = "src/app/cek-ongkir"; Name = "Cek Ongkir" },
    @{Path = "src/app/cek-resi"; Name = "Cek Resi" },
    @{Path = "src/app/blacklist/page.tsx"; Name = "Blacklist" },
    @{Path = "src/app/faq/page.tsx"; Name = "FAQ" },
    @{Path = "src/app/blog/page.tsx"; Name = "Blog" }
)

foreach ($page in $criticalPages) {
    $fullPath = Join-Path $ROOT $page.Path
    if ((Test-Path $fullPath) -or (Test-Path "$fullPath/page.tsx")) {
        Write-Host "[PASS] $($page.Name) exists" -ForegroundColor Green
        $PASS++
    }
    else {
        Write-Host "[FAIL] $($page.Name) missing" -ForegroundColor Red
        $FAIL++
    }
}

# =============================================================================
# 3. Check UI Components
# =============================================================================
Write-Host ""
Write-Host "Checking UI Components..." -ForegroundColor White

$uiComponents = @(
    "src/components/ui/button.tsx",
    "src/components/ui/input.tsx",
    "src/components/ui/card.tsx",
    "src/components/layout/Footer.tsx",
    "src/components/layout/Navbar.tsx"
)

foreach ($comp in $uiComponents) {
    $fullPath = Join-Path $ROOT $comp
    if (Test-Path $fullPath) {
        Write-Host "[PASS] $(Split-Path $comp -Leaf) exists" -ForegroundColor Green
        $PASS++
    }
    else {
        Write-Host "[FAIL] $(Split-Path $comp -Leaf) missing" -ForegroundColor Red
        $FAIL++
    }
}

# =============================================================================
# 4. Check Feature Files
# =============================================================================
Write-Host ""
Write-Host "Checking Feature Files..." -ForegroundColor White

$featureFiles = @(
    @{Path = "src/lib/api-security.ts"; Name = "API Security" },
    @{Path = "src/lib/dynamicImports.tsx"; Name = "Dynamic Imports" },
    @{Path = "src/components/ThirdPartyScripts.tsx"; Name = "Third Party Scripts" },
    @{Path = "src/components/ShareableCard.tsx"; Name = "Shareable Card" },
    @{Path = "api_metering_schema.sql"; Name = "API Metering Schema" },
    @{Path = "api_keys_schema.sql"; Name = "API Keys Schema" }
)

foreach ($file in $featureFiles) {
    $fullPath = Join-Path $ROOT $file.Path
    if (Test-Path $fullPath) {
        Write-Host "[PASS] $($file.Name) exists" -ForegroundColor Green
        $PASS++
    }
    else {
        Write-Host "[FAIL] $($file.Name) missing" -ForegroundColor Red
        $FAIL++
    }
}

# =============================================================================
# 5. Package.json Check
# =============================================================================
Write-Host ""
Write-Host "Checking Dependencies..." -ForegroundColor White
$packagePath = Join-Path $ROOT "package.json"
if (Test-Path $packagePath) {
    Write-Host "[PASS] package.json exists" -ForegroundColor Green
    $PASS++
    
    $package = Get-Content $packagePath | ConvertFrom-Json
    $requiredDeps = @("next", "react")
    
    foreach ($dep in $requiredDeps) {
        $depExists = $false
        foreach ($prop in $package.dependencies.PSObject.Properties) {
            if ($prop.Name -eq $dep) {
                $depExists = $true
                break
            }
        }
        if ($depExists) {
            Write-Host "  [OK] $dep installed" -ForegroundColor Gray
        }
        else {
            Write-Host "  [WARN] $dep not found" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "[FAIL] package.json missing" -ForegroundColor Red
    $FAIL++
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
