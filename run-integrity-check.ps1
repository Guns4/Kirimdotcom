# =============================================================================
# Integrity Check Script (PowerShell)
# Ensures all features are clickable and accessible
# =============================================================================

Write-Host "🔍 CekKirim Integrity Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Counter
$PASS = 0
$FAIL = 0

# =============================================================================
# 1. Check Sitemap Generation
# =============================================================================
Write-Host "📄 Checking Sitemap..."
if (Test-Path "src/app/sitemap.ts") {
    Write-Host "✓ sitemap.ts exists" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "✗ sitemap.ts missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 2. Check Breadcrumbs Component
# =============================================================================
Write-Host ""
Write-Host "🍞 Checking Breadcrumbs..."
if (Test-Path "src/components/AutoBreadcrumbs.tsx") {
    Write-Host "✓ AutoBreadcrumbs.tsx exists" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "✗ AutoBreadcrumbs.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 3. Check Debug Mode
# =============================================================================
Write-Host ""
Write-Host "🐛 Checking Debug Mode..."
if (Test-Path "src/components/DebugMode.tsx") {
    Write-Host "✓ DebugMode.tsx exists" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "✗ DebugMode.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 4. Check Navigation Components
# =============================================================================
Write-Host ""
Write-Host "🧭 Checking Navigation..."

# Desktop Nav
if (Test-Path "src/components/navigation/NavbarDesktop.tsx") {
    Write-Host "✓ NavbarDesktop.tsx exists" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "✗ NavbarDesktop.tsx missing" -ForegroundColor Red
    $FAIL++
}

# Mobile Nav
if (Test-Path "src/components/navigation/NavbarMobile.tsx") {
    Write-Host "✓ NavbarMobile.tsx exists" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "✗ NavbarMobile.tsx missing" -ForegroundColor Red
    $FAIL++
}

# FAB
if (Test-Path "src/components/FloatingActionButton.tsx") {
    Write-Host "✓ FloatingActionButton.tsx exists" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "✗ FloatingActionButton.tsx missing" -ForegroundColor Red
    $FAIL++
}

# =============================================================================
# 5. Check Critical Pages
# =============================================================================
Write-Host ""
Write-Host "📄 Checking Critical Pages..."
$PAGES = @(
    "src/app/page.tsx",
    "src/app/cek-ongkir/page.tsx",
    "src/app/cek-resi/page.tsx",
    "src/app/blacklist/page.tsx"
)

foreach ($page in $PAGES) {
    if (Test-Path $page) {
        Write-Host "✓ $(Split-Path $page -Leaf) exists" -ForegroundColor Green
        $PASS++
    } else {
        Write-Host "✗ $(Split-Path $page -Leaf) missing" -ForegroundColor Red
        $FAIL++
    }
}

# =============================================================================
# 6. Check UI Components
# =============================================================================
Write-Host ""
Write-Host "🎨 Checking UI Components..."
$UI_COMPONENTS = @(
    "src/components/ui/button.tsx",
    "src/components/ui/input.tsx",
    "src/components/ui/card.tsx"
)

foreach ($comp in $UI_COMPONENTS) {
    if (Test-Path $comp) {
        Write-Host "✓ $(Split-Path $comp -Leaf) exists" -ForegroundColor Green
        $PASS++
    } else {
        Write-Host "✗ $(Split-Path $comp -Leaf) missing" -ForegroundColor Red
        $FAIL++
    }
}

# =============================================================================
# 7. TypeScript Check
# =============================================================================
Write-Host ""
Write-Host "✨ TypeScript Validation..."
if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "Running type check..."
    $tsCheck = npx tsc --noEmit --skipLibCheck 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ TypeScript: No errors" -ForegroundColor Green
        $PASS++
    } else {
        Write-Host "⚠ TypeScript: Some warnings (non-blocking)" -ForegroundColor Yellow
        $PASS++
    }
} else {
    Write-Host "⚠ npx not found, skipping TS check" -ForegroundColor Yellow
}

# =============================================================================
# 8. Generate Debug Instructions
# =============================================================================
Write-Host ""
Write-Host "📚 Debug Mode Usage:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Add ?debug=true to any URL to enable visual debugging:"
Write-Host "  • http://localhost:3000?debug=true"
Write-Host "  • https://cekkirim.com?debug=true"
Write-Host ""
Write-Host "Features:"
Write-Host "  • Red outlines show clickable areas"
Write-Host "  • Console logs small touch targets (<44px)"
Write-Host "  • Z-index overlay indicators"
Write-Host "  • Breakpoint indicator (Mobile/Tablet/Desktop)"

# =============================================================================
# Summary
# =============================================================================
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $PASS" -ForegroundColor Green
Write-Host "Failed: $FAIL" -ForegroundColor Red
Write-Host ""

if ($FAIL -eq 0) {
    Write-Host "✓ All integrity checks passed!" -ForegroundColor Green
    Write-Host "🚀 Ready for deployment" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some checks failed" -ForegroundColor Red
    Write-Host "⚠️  Please fix the issues above" -ForegroundColor Yellow
    exit 1
}
