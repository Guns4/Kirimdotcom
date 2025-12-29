#!/bin/bash

# =============================================================================
# UI Surfaces, Depth & Elevation Setup
# =============================================================================

echo "Initializing UI Surfaces Upgrade..."
echo "================================================="

# 1. Refine Shadows in globals.css
echo "1. Patching Shadows in src/app/globals.css..."
# Appending custom Shadow logic to the end of file (inside @layer utilities ideally, 
# but simply appending works for new classes or we use a sed approach to insert).
# To be robust, we'll append a new @layer utilities block.

cat <<EOF >> src/app/globals.css

/* DEPTH & ELEVATION UPGRADE */
@layer utilities {
  .shadow-card {
    /* Light Mode: Soft, diffused shadow */
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  }
  
  .dark .shadow-card {
    /* Dark Mode: No shadow, rely on border & highlights */
    box-shadow: none;
    /* Optional: Slight highlight on top border for "light source" effect */
    border-top: 1px solid rgb(255 255 255 / 0.08);
  }

  /* Glassmorphism helpers for dark mode */
  .glass-surface {
    @apply bg-white/70 backdrop-blur-md border border-white/20;
  }
  .dark .glass-surface {
    @apply bg-black/40 backdrop-blur-md border border-white/10;
  }
}
EOF

# 2. Refactor Card Component (Shadcn UI Standard)
echo "2. Enforcing Card Design System in src/components/ui/card.tsx..."
mkdir -p src/components/ui

# Re-writing the component to ensure it complies with the "Card Logic" request.
cat <<EOF > src/components/ui/card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base: Rounded, Bordered, Background Color
      "rounded-xl border border-border bg-card text-card-foreground shadow-card",
      // Mobile optimization: Less padding/shadow if needed? kept standard here.
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
EOF

# 3. Report/Scan for Hardcoded Styles
echo "3. Scanning for Hardcoded Styles (bg-white, shadow-lg)..."

node -e "
const fs = require('fs');
const path = require('path');

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Check for hardcoded bg-white used as card (heuristic)
            if (content.includes('bg-white') && content.includes('shadow-')) {
                 console.log('   [WARN] Potential hardcoded card style in:', fullPath);
                 console.log('          Consider replacing with <Card> component.');
            }
        }
    });
}

console.log('   --- Scan Results ---');
scanDir('src');
console.log('   --- End Scan ---');
"

echo ""
echo "================================================="
echo "UI Surfaces Setup Complete!"
echo "1. src/app/globals.css updated with .shadow-card utility."
echo "2. src/components/ui/card.tsx updated to use border/bg-card."
echo "3. Check the Scan Results above for any cleanup needed."
