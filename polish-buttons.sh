#!/bin/bash

# =============================================================================
# Button Component Polish (Touch Friendly & Modern)
# =============================================================================

echo "Initializing Button Polish..."
echo "================================================="

# 1. Backup
echo "1. Backing up Button component..."
cp src/components/ui/button.tsx src/components/ui/button.tsx.bak 2>/dev/null

# 2. Rewrite Button Component
echo "2. Applying Modern Styles to src/components/ui/button.tsx..."

# We use cat to completely rewrite the file with the verified content + polish.
cat <<EOF > src/components/ui/button.tsx
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button Component - Polished
 * Features: 
 * - Height: Min h-10 (Touch friendly)
 * - Shape: Rounded-Full (Modern Pill)
 * - Font: Medium (Clean)
 * - Interaction: Active Scale-95 (Tactile feedback)
 */

const buttonVariants = cva(
    // Base styles
    \`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full
   text-sm font-medium ring-offset-background transition-all duration-200
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
   active:scale-95\`,
    {
        variants: {
            variant: {
                // Primary
                primary: \`
          bg-primary text-primary-foreground shadow-md
          hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5
        \`,

                // Secondary
                secondary: \`
          bg-secondary text-secondary-foreground shadow-sm
          hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5
        \`,

                // Outline
                outline: \`
          border border-input bg-background shadow-sm
          hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5
        \`,

                // Ghost
                ghost: \`
          hover:bg-accent hover:text-accent-foreground
        \`,

                // Destructive
                destructive: \`
          bg-destructive text-destructive-foreground shadow-sm
          hover:bg-destructive/90 hover:shadow-md hover:-translate-y-0.5
        \`,

                // Link
                link: \`
          text-primary underline-offset-4 hover:underline
        \`,
                
                // Legacy Gradient Support (Mapped to Primary for consistency, or kept unique)
                gradient: \`
          bg-primary text-primary-foreground shadow-md
          hover:bg-primary/90
        \`,
                'gradient-brand': \`
          bg-primary text-primary-foreground shadow-md
          hover:bg-primary/90
        \`
            },
            size: {
                sm: 'h-10 px-4 text-xs',      // Bumped from h-9
                md: 'h-11 px-6 py-2',         // Bumped from h-10
                lg: 'h-12 px-8 text-base',    // Bumped from h-11
                xl: 'h-14 px-10 text-lg',     // Extra large
                icon: 'h-10 w-10',            // standard icon
                'icon-sm': 'h-9 w-9',
                'icon-lg': 'h-12 w-12',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, asChild, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;
EOF

echo ""
echo "================================================="
echo "Button Polish Complete!"
echo "1. Updated to use CSS Variables (bg-primary, text-primary-foreground)."
echo "2. Shape: Rounded-Full (Pill)."
echo "3. States: Standardized hover/active effects."
