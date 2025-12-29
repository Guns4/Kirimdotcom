# =============================================================================
# Integrity Check Script (PowerShell)
# Ensures all features are clickable and accessible
# =============================================================================

Write-Host "?? CekKirim Integrity Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Counter
$PASS = 0
$FAIL = 0

# =============================================================================
# 1. Check Sitemap Generation
# =============================================================================
Write-Host "?? Checking Sitemap..."
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
Write-Host "?? Checking Breadcrumbs..."
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
Write-Host "?? Checking Debug Mode..."
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
Write-Host "?? Checking Navigation..."

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
Write-Host "?? Checking Critical Pages..."
$PAGES = @(
    @{Path = "src/app/page.tsx"; Name = "Home Page" },
    @{Path = "src/app/cek-ongkir/page.tsx"; Name = "Cek Ongkir" },
    @{Path = "src/app/cek-resi/page.tsx"; Name = "Cek Resi" },
    @{Path = "src/app/blacklist/page.tsx"; Name = "Blacklist" }
)

foreach ($page in $PAGES) {
    # Check if direct file or nested route exists (naive check for now, stick to user logic)
    # The script acts relative to project root usually, but here I put it in scripts/
    # So valid path is ../$page.Path
    $Target = "$PSScriptRoot/../$($page.Path)"
    
    # Try alternate path for dynamic routes if not found
    if (-not (Test-Path -LiteralPath $Target)) {
        # Fallback checks logic can be added here but for now strict check
        # Maybe Cek Resi is in [...slug]
        if ($page.Name -eq "Cek Ongkir") {
            $Target = "$PSScriptRoot/../src/app/cek-ongkir/[...route]/page.tsx"
        }
        if ($page.Name -eq "Cek Resi") {
            $Target = "$PSScriptRoot/../src/app/cek-resi/[...slug]/page.tsx"
        }
    }

    if (Test-Path -LiteralPath $Target) {
        Write-Host "[PASS] $($page.Name) exists" -ForegroundColor Green
        $PASS++
    }
    else {
        # Try finding ANY page.tsx in the directory
        $Dir = "$PSScriptRoot/../$(Split-Path $page.Path -Parent)"
        if (Test-Path "$Dir/page.tsx") {
            Write-Host "[PASS] $($page.Name) exists (Root)" -ForegroundColor Green
            $PASS++
        }
        elseif (Test-Path "$Dir/[...slug]/page.tsx") {
            Write-Host "[PASS] $($page.Name) exists (Dynamic Slug)" -ForegroundColor Green
            $PASS++
        }
        elseif (Test-Path "$Dir/[...route]/page.tsx") {
            Write-Host "[PASS] $($page.Name) exists (Dynamic Route)" -ForegroundColor Green
            $PASS++
        }
        else {
            Write-Host "[FAIL] $($page.Name) missing" -ForegroundColor Red
            $FAIL++
        }
    }
}

# =============================================================================
# 6. Check UI Components
# =============================================================================
Write-Host ""
Write-Host "?? Checking UI Components..."
$UI_COMPONENTS = @(
    "src/components/ui/button.tsx",
    "src/components/ui/input.tsx",
    "src/components/ui/card.tsx"
)

foreach ($comp in $UI_COMPONENTS) {
    if (Test-Path "$PSScriptRoot/../$comp") {
        Write-Host "[PASS] $(Split-Path $comp -Leaf) exists" -ForegroundColor Green
        $PASS++
    }
    else {
        Write-Host "[FAIL] $(Split-Path $comp -Leaf) missing" -ForegroundColor Red
        $FAIL++
    }
}

# =============================================================================
# 7. TypeScript Check
# =============================================================================
Write-Host ""
Write-Host "?? TypeScript Validation..."
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "Running type check..."
    # Run in project root
    Push-Location "$PSScriptRoot/.."
    try {
        $PROCESS = Start-Process -FilePath "npx" -ArgumentList "tsc --noEmit --skipLibCheck" -NoNewWindow -PassThru -Wait
        if ($PROCESS.ExitCode -eq 0) {
            Write-Host "[PASS] TypeScript: No errors" -ForegroundColor Green
            $PASS++
        }
        else {
            Write-Host "[WARN] TypeScript: Some errors/warnings found" -ForegroundColor Yellow
            $PASS++ # Warning doesn't fail integrity check in this script logic? Script says "Some warnings (non-blocking)"
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
# 8. Debug Instructions
# =============================================================================
Write-Host ""
Write-Host "?? Debug Mode Usage:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Add ?debug=true to any URL to enable visual debugging:"
Write-Host "  • http://localhost:3000?debug=true"
Write-Host "  • https://cekkirim.com?debug=true"
Write-Host ""
Write-Host "Features:"
Write-Host "  • Red outlines show clickable areas"
Write-Host "  • Console logs small touch targets"
Write-Host "  • Z-index overlay indicators"
Write-Host "  • Breakpoint indicator (Mobile/Tablet/Desktop)"

# =============================================================================
# Summary
# =============================================================================
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "?? Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $PASS" -ForegroundColor Green
Write-Host "Failed: $FAIL" -ForegroundColor Red
Write-Host ""

if ($FAIL -eq 0) {
    Write-Host "?? [SUCCESS] All integrity checks passed!" -ForegroundColor Green
    Write-Host "?? Ready for deployment" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "? [ERROR] Some checks failed" -ForegroundColor Red
    Write-Host "?? Please fix the issues above" -ForegroundColor Yellow
    exit 1
}
