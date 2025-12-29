import { cn } from "@/lib/utils";
import React from "react";
import { Container } from "./Container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    useContainer?: boolean;
    as?: React.ElementType;
}

/**
 * Section Component
 * 
 * Provides consistent vertical spacing:
 * - Mobile: 64px padding (py-16)
 * - Desktop: 96px padding (py-24)
 * 
 * Automatically wraps content in Container unless useContainer={false}
 * 
 * @example Standard section with container
 * <Section>
 *   <h2>Section Title</h2>
 *   <p>Content here</p>
 * </Section>
 * 
 * @example Without container (full width)
 * <Section useContainer={false} className="bg-gray-100">
 *   <YourFullWidthComponent />
 * </Section>
 * 
 * @example Custom padding
 * <Section className="section-pt-0">
 *   No top padding
 * </Section>
 */
export function Section({
    className,
    children,
    useContainer = true,
    as: Component = "section",
    ...props
}: SectionProps) {
    const content = useContainer ? <Container>{children}</Container> : children;

    return (
        <Component
            className={cn("section-spacing", className)}
            {...props}
        >
            {content}
        </Component>
    );
}
