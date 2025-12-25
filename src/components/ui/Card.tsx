import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
    hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, glass = false, hover = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(
                    'rounded-xl border transition-all duration-300',
                    {
                        'glass-card': glass,
                        'bg-white border-gray-200 shadow-sm': !glass,
                        'hover:shadow-xl hover:-translate-y-1': hover,
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx('p-6 pb-4', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={clsx('text-xl font-semibold text-gray-900', className)}
                {...props}
            >
                {children}
            </h3>
        );
    }
);

CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx('p-6 pt-0', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
