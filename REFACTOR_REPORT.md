# Code Refactor Report
Generated on: 30/12/2025, 16.59.34

## 📁 Loose Components in Root

Components in `src/components/` root that could be moved to subfolders:

| Component | Suggested Folder | Action |
|-----------|------------------|--------|
| `AutoBreadcrumbs.tsx` | `common/` | Move |
| `BottomNav.tsx` | `navigation/` | Move |
| `Breadcrumbs.tsx` | `common/` | Move |
| `ChatbotWidget.tsx` | `common/` | Move |
| `CommandPalette.tsx` | `common/` | Move |
| `DebugMode.tsx` | `common/` | Move |
| `ErrorBoundary.tsx` | `common/` | Move |
| `FloatingActionButton.tsx` | `ui/` | Move |
| `Footer.tsx` | `navigation/` | Move |
| `MagicTrackingHeader.tsx` | `navigation/` | Move |
| `MinimalFooter.tsx` | `navigation/` | Move |
| `Navbar.tsx` | `navigation/` | Move |
| `PageHeader.tsx` | `navigation/` | Move |
| `ShareableCard.tsx` | `ui/` | Move |
| `ThirdPartyScripts.tsx` | `common/` | Move |

**Total loose components:** 15

## 🔄 Potential Duplicates

Components with similar names that might be consolidated:

| Base Pattern | Files | Action |
|--------------|-------|--------|
| `affiliate` | AffiliateButton.tsx, AffiliateCard.tsx | Review & Consolidate |
| `bottomnav` | BottomNav.tsx, BottomNav.tsx | Review & Consolidate |
| `captiongenerator` | CaptionGenerator.tsx, CaptionGenerator.tsx | Review & Consolidate |
| `footer` | Footer.tsx, Footer.tsx | Review & Consolidate |
| `labelgenerator` | LabelGenerator.tsx, LabelGeneratorWrapper.tsx | Review & Consolidate |
| `navbar` | Navbar.tsx, Navbar.tsx, NavbarWrapper.tsx | Review & Consolidate |
| `verifiedbadge` | VerifiedBadge.tsx, VerifiedBadge.tsx | Review & Consolidate |
| `shareable` | ShareableCard.tsx, ShareableCard.tsx | Review & Consolidate |
| `imagecompressor` | ImageCompressor.tsx, ImageCompressorWrapper.tsx | Review & Consolidate |

## 📏 Large Components (Candidates for Splitting)

| Component | Lines | Suggestion |
|-----------|-------|------------|
| `src/components/admin/AdminTable.tsx` | 404 | Consider extracting logic to hooks |
| `src/components/ads/NativeAds.tsx` | 328 | Consider extracting logic to hooks |
| `src/components/BottomNav.tsx` | 330 | Consider extracting logic to hooks |
| `src/components/CommandPalette.tsx` | 411 | Consider extracting logic to hooks |
| `src/components/forms/SmartAddressInput.tsx` | 349 | Consider extracting logic to hooks |
| `src/components/gamification/GamificationComponents.tsx` | 418 | Consider extracting logic to hooks |
| `src/components/label/LabelGenerator.tsx` | 583 | Consider splitting into sub-components |
| `src/components/label-maker/LabelMakerCanvas.tsx` | 317 | Consider extracting logic to hooks |
| `src/components/logistics/TrackingResults.tsx` | 360 | Consider extracting logic to hooks |
| `src/components/mobile/NativeSheets.tsx` | 463 | Consider extracting logic to hooks |
| `src/components/navigation/NavbarMobile.tsx` | 302 | Consider extracting logic to hooks |
| `src/components/navigation/UserNavActions.tsx` | 343 | Consider extracting logic to hooks |
| `src/components/tools/CODRiskChecker.tsx` | 414 | Consider extracting logic to hooks |
| `src/components/tools/ImageCompressor.tsx` | 343 | Consider extracting logic to hooks |
| `src/components/tools/MarketplaceCalculator.tsx` | 351 | Consider extracting logic to hooks |
| `src/components/tracking/ResiScanner.tsx` | 303 | Consider extracting logic to hooks |

## 📦 Import Recommendations

> ⚠️ **Missing Barrel Export**: Consider creating `src/components/index.ts` for cleaner imports.

Example:
```typescript
// src/components/index.ts
export * from './ui';
export * from './common';
export { TrackingCard } from './ui/TrackingCard';
```

## 📊 Summary

- **Loose components in root:** 15
- **Potential duplicate patterns:** 9
- **Large components (>300 lines):** 16
- **Barrel export:** ❌ Missing

## 🛠️ Created Components

- ✅ `src/components/ui/TrackingCard.tsx` - Unified tracking card with variants
