#!/bin/bash

# =============================================================================
# Layout & Spacing Standardization
# =============================================================================

echo "Initializing Layout Spacing System..."
echo "================================================="

# 1. Inject CSS Utilities
echo "1. Adding .container-custom and .section-spacing to globals.css..."

cat <<EOF >> src/app/globals.css

/* LAYOUT STANDARDIZATION */
@layer components {
  /* 
   * Container: Macbook Friendly (1280px)
   * Padding: Mobile(1rem/16px) -> Tablet(2rem/32px) -> Desktop(4rem/64px)
   */
  .container-custom {
    @apply max-w-[1280px] mx-auto px-4 md:px-8 lg:px-16 w-full;
  }

  /* 
   * Section Spacing: Space to Breathe 
   * Mobile: 4rem (64px) -> Desktop: 6rem (96px)
   */
  .section-spacing {
    @apply py-16 md:py-24;
  }
  
  /* Helper for no-padding top/bottom if needed */
  .section-pt-0 { @apply pt-0; }
  .section-pb-0 { @apply pb-0; }
}
EOF

# 2. Create Layout Components
echo "2. Creating Reusable Layout Components..."
mkdir -p src/components/layout

# Container Component
cat <<EOF > src/components/layout/Container.tsx
import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Container({ 
  as: Component = "div", 
  className, 
  children, 
  ...props 
}: ContainerProps) {
  return (
    <Component 
      className={cn("container-custom", className)} 
      {...props}
    >
      {children}
    </Component>
  );
}
EOF

# Section Component
cat <<EOF > src/components/layout/Section.tsx
import { cn } from "@/lib/utils";
import React from "react";
import { Container } from "./Container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  useContainer?: boolean;
}

export function Section({ 
  className, 
  children, 
  useContainer = true,
  ...props 
}: SectionProps) {
  const content = useContainer ? <Container>{children}</Container> : children;

  return (
    <section 
      className={cn("section-spacing", className)} 
      {...props}
    >
      {content}
    </section>
  );
}
EOF

# 3. Audit Script
echo "3. Auditing Pages for Spacing Compliance..."

# We use a Node script to scan for 'page.tsx' and check if they use standard containers
node -e "
const fs = require('fs');
const path = require('path');

function scanDir(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, fileList);
        } else if (file === 'page.tsx') {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Check if it looks 'naked' (no container class found)
            // This is a heuristic check.
            const hasContainer = content.includes('container') || content.includes('max-w-');
            const hasSection = content.includes('Section') || content.includes('py-');
            
            if (!hasContainer && !hasSection) {
                fileList.push(fullPath);
            }
        }
    });
    return fileList;
}

const reportFile = 'LAYOUT_FIX_LIST.md';
const nakedFiles = scanDir('src/app');

let reportContent = '# Layout Spacing Audit\\n\\n';
if (nakedFiles.length > 0) {
    reportContent += 'The following pages might lack proper containers or spacing:\\n\\n';
    nakedFiles.forEach(f => reportContent += '- [ ] \`' + f + '\`\\n');
    reportContent += '\\n**Suggestion**: Wrap content in \`<Section>\` or use \`.container-custom\`.';
} else {
    reportContent += '✅ All pages seem to have some layout naming. Good job!';
}

fs.writeFileSync(reportFile, reportContent);
console.log('   [i] Audit report saved to ' + reportFile);
"

echo ""
echo "================================================="
echo "Layout System Ready!"
echo "1. Use '<Container>' or '<Section>' components in your pages."
echo "2. Check 'LAYOUT_FIX_LIST.md' for pages that need attention."
