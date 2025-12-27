import { cn } from '@/lib/utils';
import { SECTION, CONTAINER, TYPOGRAPHY } from '@/lib/spacing';

/**
 * Layout Components with proper spacing
 */

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
    background?: 'white' | 'gray' | 'gradient' | 'dark';
    id?: string;
}

/**
 * Section component with consistent vertical padding
 */
export function Section({
    children,
    className,
    size = 'lg',
    background = 'white',
    id,
}: SectionProps) {
    const bgClasses = {
        white: 'bg-white',
        gray: 'bg-surface-50',
        gradient: 'bg-gradient-to-br from-primary-50 via-white to-accent-50',
        dark: 'bg-surface-900 text-white',
    };

    return (
        <section
            id={id}
            className={cn(SECTION[size], bgClasses[background], className)}
        >
            {children}
        </section>
    );
}

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Container component with max-width constraint
 */
export function Container({
    children,
    className,
    width = 'xl',
}: ContainerProps) {
    return (
        <div className={cn('container mx-auto px-4', CONTAINER[width], className)}>
            {children}
        </div>
    );
}

interface ProseProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Prose wrapper for long-form content with proper typography
 */
export function Prose({ children, className }: ProseProps) {
    return (
        <div
            className={cn(
                'prose prose-surface max-w-none',
                'prose-headings:font-bold prose-headings:tracking-tight',
                'prose-p:leading-relaxed prose-p:text-surface-600',
                'prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline',
                'prose-li:leading-relaxed',
                'prose-img:rounded-xl',
                className
            )}
        >
            {children}
        </div>
    );
}

interface StackProps {
    children: React.ReactNode;
    className?: string;
    gap?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Vertical stack with consistent gaps
 */
export function Stack({ children, className, gap = 'md' }: StackProps) {
    const gapClasses = {
        sm: 'space-y-4',
        md: 'space-y-6',
        lg: 'space-y-8',
        xl: 'space-y-12',
    };

    return (
        <div className={cn(gapClasses[gap], className)}>
            {children}
        </div>
    );
}

interface GridProps {
    children: React.ReactNode;
    className?: string;
    cols?: 1 | 2 | 3 | 4;
    gap?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive grid with consistent gaps
 */
export function Grid({ children, className, cols = 3, gap = 'md' }: GridProps) {
    const colClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    const gapClasses = {
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
    };

    return (
        <div className={cn('grid', colClasses[cols], gapClasses[gap], className)}>
            {children}
        </div>
    );
}

export default { Section, Container, Prose, Stack, Grid };
