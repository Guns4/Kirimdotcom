'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Page Transition Animations
 * Butter-smooth fade + slide up effects
 */

// Animation Variants
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1], // Custom easing
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
            ease: 'easeIn',
        },
    },
};

export const fadeInVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3 },
    },
    exit: { opacity: 0 },
};

export const slideUpVariants: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
};

export const staggerContainerVariants: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const staggerItemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
};

// Page Transition Wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Fade In on scroll/mount
export function FadeIn({
    children,
    delay = 0,
    className,
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger Children Animation
export function StaggerContainer({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainerVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div variants={staggerItemVariants} className={className}>
            {children}
        </motion.div>
    );
}

// Scale on tap
export function ScaleOnTap({
    children,
    scale = 0.97,
    className,
}: {
    children: React.ReactNode;
    scale?: number;
    className?: string;
}) {
    return (
        <motion.div
            whileTap={{ scale }}
            transition={{ duration: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Hover lift effect
export function HoverLift({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default {
    PageTransition,
    FadeIn,
    StaggerContainer,
    StaggerItem,
    ScaleOnTap,
    HoverLift,
    pageVariants,
    fadeInVariants,
    slideUpVariants,
};
