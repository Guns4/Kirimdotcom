import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
}

/**
 * Container Component
 * 
 * Provides consistent max-width and responsive padding:
 * - Max width: 1280px (Macbook friendly)
 * - Mobile: 16px padding
 * - Tablet: 32px padding  
 * - Desktop: 64px padding
 * 
 * @example
 * <Container>
 *   <h1>My Content</h1>
 * </Container>
 * 
 * @example With custom element
 * <Container as="main">
 *   <h1>My Content</h1>
 * </Container>
 */
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
