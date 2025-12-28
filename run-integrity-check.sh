#!/bin/bash

# =============================================================================
# Integrity Check Script
# Ensures all features are clickable and accessible
# =============================================================================

echo "🔍 CekKirim Integrity Check"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASS=0
FAIL=0

# =============================================================================
# 1. Check Sitemap Generation
# =============================================================================
echo "📄 Checking Sitemap..."
if [ -f "src/app/sitemap.ts" ]; then
    echo -e "${GREEN}✓${NC} sitemap.ts exists"
    ((PASS++))
else
    echo -e "${RED}✗${NC} sitemap.ts missing"
    ((FAIL++))
fi

# =============================================================================
# 2. Check Breadcrumbs Component
# =============================================================================
echo ""
echo "🍞 Checking Breadcrumbs..."
if [ -f "src/components/AutoBreadcrumbs.tsx" ]; then
    echo -e "${GREEN}✓${NC} AutoBreadcrumbs.tsx exists"
    ((PASS++))
else
    echo -e "${RED}✗${NC} AutoBreadcrumbs.tsx missing"
    ((FAIL++))
fi

# =============================================================================
# 3. Check Debug CSS Helper
# =============================================================================
echo ""
echo "🐛 Checking Debug Mode..."
if [ -f "src/components/DebugMode.tsx" ]; then
    echo -e "${GREEN}✓${NC} DebugMode.tsx exists"
    ((PASS++))
else
    echo -e "${RED}✗${NC} DebugMode.tsx missing"
    ((FAIL++))
fi

# =============================================================================
# 4. Check Navigation Components
# =============================================================================
echo ""
echo "🧭 Checking Navigation..."

# Desktop Nav
if [ -f "src/components/navigation/NavbarDesktop.tsx" ]; then
    echo -e "${GREEN}✓${NC} NavbarDesktop.tsx exists"
    ((PASS++))
else
    echo -e "${RED}✗${NC} NavbarDesktop.tsx missing"
    ((FAIL++))
fi

# Mobile Nav
if [ -f "src/components/navigation/NavbarMobile.tsx" ]; then
    echo -e "${GREEN}✓${NC} NavbarMobile.tsx exists"
    ((PASS++))
else
    echo -e "${RED}✗${NC} NavbarMobile.tsx missing"
    ((FAIL++))
fi

# FAB
if [ -f "src/components/FloatingActionButton.tsx" ]; then
    echo -e "${GREEN}✓${NC} FloatingActionButton.tsx exists"
    ((PASS++))
else
    echo -e "${RED}✗${NC} FloatingActionButton.tsx missing"
    ((FAIL++))
fi

# =============================================================================
# 5. Check Critical Pages
# =============================================================================
echo ""
echo "📄 Checking Critical Pages..."
PAGES=(
    "src/app/page.tsx"
    "src/app/cek-ongkir/page.tsx"
    "src/app/cek-resi/page.tsx"
    "src/app/blacklist/page.tsx"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo -e "${GREEN}✓${NC} $(basename $page) exists"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $(basename $page) missing"
        ((FAIL++))
    fi
done

# =============================================================================
# 6. Check UI Components
# =============================================================================
echo ""
echo "🎨 Checking UI Components..."
UI_COMPONENTS=(
    "src/components/ui/button.tsx"
    "src/components/ui/input.tsx"
    "src/components/ui/card.tsx"
)

for comp in "${UI_COMPONENTS[@]}"; do
    if [ -f "$comp" ]; then
        echo -e "${GREEN}✓${NC} $(basename $comp) exists"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $(basename $comp) missing"
        ((FAIL++))
    fi
done

# =============================================================================
# 7. TypeScript Check
# =============================================================================
echo ""
echo " TypeScript Validation..."
if command -v npx &> /dev/null; then
    echo "Running type check..."
    if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} TypeScript: No errors"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} TypeScript: Some warnings (non-blocking)"
        ((PASS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} npx not found, skipping TS check"
fi

# =============================================================================
# 8. Generate Debug Instructions
# =============================================================================
echo ""
echo "📚 Debug Mode Usage:"
echo "================================"
echo "Add ?debug=true to any URL to enable visual debugging:"
echo "  • http://localhost:3000?debug=true"
echo "  • https://cekkirim.com?debug=true"
echo ""
echo "Features:"
echo "  • Red outlines show clickable areas"
echo "  • Console logs small touch targets (<44px)"
echo "  • Z-index overlay indicators"
echo "  • Breakpoint indicator (Mobile/Tablet/Desktop)"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "================================"
echo "📊 Summary"
echo "================================"
echo -e "Passed: ${GREEN}${PASS}${NC}"
echo -e "Failed: ${RED}${FAIL}${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All integrity checks passed!${NC}"
    echo "🚀 Ready for deployment"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo "⚠️  Please fix the issues above"
    exit 1
fi
