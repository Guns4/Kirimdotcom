/**
 * Spacing & Typography Standards
 * Design system utilities for consistent spacing
 */

// ============================================
// Container Standards
// ============================================

export const CONTAINER = {
    // Max widths
    sm: 'max-w-3xl',      // 768px - Blog content
    md: 'max-w-5xl',      // 1024px - Default pages
    lg: 'max-w-6xl',      // 1152px - Wide content
    xl: 'max-w-7xl',      // 1280px - Full width sections
    full: 'max-w-full',   // No limit

    // Default container class
    default: 'container mx-auto px-4 max-w-7xl',
};

// ============================================
// Section Spacing
// ============================================

export const SECTION = {
    // Vertical padding for sections
    sm: 'py-8 lg:py-12',
    md: 'py-12 lg:py-16',
    lg: 'py-16 lg:py-20',
    xl: 'py-20 lg:py-28',
    hero: 'py-20 lg:py-32',

    // Default section padding
    default: 'py-16 lg:py-20',
};

// ============================================
// Typography
// ============================================

export const TYPOGRAPHY = {
    // Headings
    h1: 'text-3xl lg:text-5xl font-bold leading-tight tracking-tight',
    h2: 'text-2xl lg:text-4xl font-bold leading-tight',
    h3: 'text-xl lg:text-2xl font-semibold leading-snug',
    h4: 'text-lg lg:text-xl font-semibold leading-snug',

    // Body text
    body: 'text-base leading-relaxed',
    bodyLarge: 'text-lg leading-relaxed',
    bodySm: 'text-sm leading-relaxed',

    // Lead paragraph (description under headings)
    lead: 'text-lg lg:text-xl text-surface-500 leading-relaxed',

    // Small/caption text
    caption: 'text-xs text-surface-500 leading-normal',
    label: 'text-sm font-medium text-surface-700',
};

// ============================================
// Gaps & Margins
// ============================================

export const SPACING = {
    // Stack spacing (vertical gaps)
    stackSm: 'space-y-4',
    stackMd: 'space-y-6',
    stackLg: 'space-y-8',
    stackXl: 'space-y-12',

    // Grid gaps
    gridSm: 'gap-4',
    gridMd: 'gap-6',
    gridLg: 'gap-8',

    // Inline spacing (horizontal gaps)
    inlineSm: 'space-x-2',
    inlineMd: 'space-x-4',
    inlineLg: 'space-x-6',
};

// ============================================
// Card Spacing
// ============================================

export const CARD = {
    padding: 'p-6',
    paddingSm: 'p-4',
    paddingLg: 'p-8',
    rounded: 'rounded-2xl',
    shadow: 'shadow-sm hover:shadow-md transition-shadow',
};

// ============================================
// Component Classes
// ============================================

/**
 * Section wrapper with proper spacing
 */
export const sectionClasses = (variant: keyof typeof SECTION = 'default') => {
    return `${SECTION[variant]}`;
};

/**
 * Container wrapper
 */
export const containerClasses = (width: keyof typeof CONTAINER = 'default') => {
    if (width === 'default') return CONTAINER.default;
    return `container mx-auto px-4 ${CONTAINER[width]}`;
};

/**
 * Typography presets
 */
export const textClasses = (variant: keyof typeof TYPOGRAPHY) => {
    return TYPOGRAPHY[variant];
};

// ============================================
// CSS Variables (for globals.css)
// ============================================

export const CSS_VARIABLES = `
  /* Container */
  --container-max-width: 1280px;
  --container-padding: 1rem;
  
  /* Section Spacing */
  --section-padding-sm: 2rem;
  --section-padding-md: 4rem;
  --section-padding-lg: 5rem;
  
  /* Typography */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
`;

export default {
    CONTAINER,
    SECTION,
    TYPOGRAPHY,
    SPACING,
    CARD,
    sectionClasses,
    containerClasses,
    textClasses,
};
