'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button Component - Shadcn-inspired with CekKirim Design System
 * Features: Hover, Active, Disabled states with smooth transitions
 */

const buttonVariants = cva(
    // Base styles
    `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg
   text-sm font-semibold ring-offset-white transition-all duration-200
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-60
   active:scale-[0.98] active:shadow-inner`,
    {
        variants: {
            variant: {
                // Primary - Deep Ocean Blue
                primary: `
          bg-primary-500 text-white shadow-primary
          hover:bg-primary-600 hover:shadow-primary-lg hover:-translate-y-0.5
          focus-visible:ring-primary-500
          disabled:bg-primary-300 disabled:shadow-none disabled:translate-y-0
        `,

                // Secondary - Vibrant Orange
                secondary: `
          bg-secondary-500 text-white shadow-secondary
          hover:bg-secondary-600 hover:shadow-secondary-lg hover:-translate-y-0.5
          focus-visible:ring-secondary-500
          disabled:bg-secondary-300 disabled:shadow-none disabled:translate-y-0
        `,

                // Outline
                outline: `
          border-2 border-primary-500 text-primary-500 bg-transparent
          hover:bg-primary-500 hover:text-white hover:-translate-y-0.5
          focus-visible:ring-primary-500
          disabled:border-surface-300 disabled:text-surface-400 disabled:translate-y-0
        `,

                // Ghost
                ghost: `
          text-surface-700 bg-transparent
          hover:bg-surface-100 hover:text-primary-500
          focus-visible:ring-surface-400
          disabled:text-surface-400
        `,

                // Destructive
                destructive: `
          bg-error-500 text-white shadow-sm
          hover:bg-error-600 hover:shadow-md hover:-translate-y-0.5
          focus-visible:ring-error-500
          disabled:bg-error-300 disabled:shadow-none disabled:translate-y-0
        `,

                // Link
                link: `
          text-primary-500 underline-offset-4
          hover:underline hover:text-primary-600
          disabled:text-surface-400
        `,

                // Gradient Primary
                gradient: `
          bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-primary
          hover:from-primary-600 hover:to-primary-700 hover:shadow-primary-lg hover:-translate-y-0.5
          focus-visible:ring-primary-500
          disabled:opacity-60 disabled:shadow-none disabled:translate-y-0
        `,

                // Gradient Brand (Blue to Orange)
                'gradient-brand': `
          bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg
          hover:from-primary-600 hover:to-secondary-600 hover:shadow-xl hover:-translate-y-0.5
          focus-visible:ring-primary-500
          disabled:opacity-60 disabled:shadow-none disabled:translate-y-0
        `,
            },
            size: {
                sm: 'h-9 px-3 text-xs rounded-md',
                md: 'h-10 px-4 py-2',
                lg: 'h-11 px-6 text-base',
                xl: 'h-12 px-8 text-base',
                icon: 'h-10 w-10',
                'icon-sm': 'h-8 w-8',
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
