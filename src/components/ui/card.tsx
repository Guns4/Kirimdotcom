'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Card Component - Shadcn-inspired with CekKirim Design System
 * Features: Glass effect, hover states, multiple variants
 */

const cardVariants = cva(
    // Base styles
    `rounded-xl border transition-all duration-300`,
    {
        variants: {
            variant: {
                // Default - Clean & Professional
                default: `
          bg-white border-surface-100
          shadow-soft
          hover:shadow-soft-lg hover:-translate-y-0.5
        `,

                // Glass - iOS-like translucent effect
                glass: `
          bg-white/70 backdrop-blur-xl border-white/20
          shadow-soft-lg
          hover:bg-white/80 hover:shadow-soft-xl
        `,

                // Glass Dark - For dark backgrounds
                'glass-dark': `
          bg-surface-900/70 backdrop-blur-xl border-white/10 text-white
          shadow-soft-lg
          hover:bg-surface-900/80 hover:shadow-soft-xl
        `,

                // Outlined
                outlined: `
          bg-transparent border-surface-200
          hover:border-surface-300 hover:bg-surface-50
        `,

                // Elevated - Higher shadow
                elevated: `
          bg-white border-transparent
          shadow-soft-lg
          hover:shadow-soft-xl hover:-translate-y-1
        `,

                // Filled - Subtle background
                filled: `
          bg-surface-50 border-surface-100
          hover:bg-surface-100
        `,

                // Primary tinted
                primary: `
          bg-primary-50 border-primary-100
          hover:bg-primary-100 hover:border-primary-200
        `,

                // Interactive - For clickable cards
                interactive: `
          bg-white border-surface-100
          shadow-soft cursor-pointer
          hover:shadow-soft-lg hover:-translate-y-1 hover:border-primary-200
          active:translate-y-0 active:shadow-soft
        `,
            },
            padding: {
                none: 'p-0',
                sm: 'p-4',
                md: 'p-6',
                lg: 'p-8',
                xl: 'p-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'md',
        },
    }
);

// Card Root
interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, padding, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant, padding }), className)}
            {...props}
        />
    )
);
Card.displayName = 'Card';

// Card Header
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5', className)}
            {...props}
        />
    )
);
CardHeader.displayName = 'CardHeader';

// Card Title
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-xl font-semibold leading-none tracking-tight text-surface-900', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

// Card Description
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn('text-sm text-surface-600', className)}
            {...props}
        />
    )
);
CardDescription.displayName = 'CardDescription';

// Card Content
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('pt-4', className)} {...props} />
    )
);
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center pt-4', className)}
            {...props}
        />
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
export default Card;
