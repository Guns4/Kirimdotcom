'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useScrollNavbar Hook
 * Detects scroll position and direction for navbar styling
 */

interface ScrollState {
    isScrolled: boolean;      // Has scrolled past threshold
    isVisible: boolean;       // Should navbar be visible
    scrollY: number;          // Current scroll position
    scrollDirection: 'up' | 'down' | null;
}

interface UseScrollNavbarOptions {
    threshold?: number;       // Pixels before showing scrolled state (default: 50)
    hideThreshold?: number;   // Pixels scrolled down before hiding (default: 200)
    showDelta?: number;       // Pixels scrolled up to show again (default: 100)
}

export function useScrollNavbar(options: UseScrollNavbarOptions = {}): ScrollState {
    const { threshold = 50, hideThreshold = 200, showDelta = 100 } = options;

    const [state, setState] = useState<ScrollState>({
        isScrolled: false,
        isVisible: true,
        scrollY: 0,
        scrollDirection: null,
    });

    const lastScrollY = useRef(0);
    const lastVisibleScrollY = useRef(0);
    const ticking = useRef(false);

    const handleScroll = useCallback(() => {
        if (!ticking.current) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';

                // Scrolled state (past threshold)
                const isScrolled = currentScrollY > threshold;

                // Visibility logic
                let isVisible = true;

                if (currentScrollY > hideThreshold) {
                    if (direction === 'down') {
                        // Scrolling down - hide navbar
                        isVisible = false;
                        lastVisibleScrollY.current = currentScrollY;
                    } else if (direction === 'up') {
                        // Scrolling up - check if scrolled up enough
                        const delta = lastVisibleScrollY.current - currentScrollY;
                        isVisible = delta > showDelta || currentScrollY < threshold;
                        if (isVisible) {
                            lastVisibleScrollY.current = currentScrollY;
                        }
                    }
                } else {
                    // Above hideThreshold - always show
                    isVisible = true;
                    lastVisibleScrollY.current = currentScrollY;
                }

                setState({
                    isScrolled,
                    isVisible,
                    scrollY: currentScrollY,
                    scrollDirection: direction,
                });

                lastScrollY.current = currentScrollY;
                ticking.current = false;
            });

            ticking.current = true;
        }
    }, [threshold, hideThreshold, showDelta]);

    useEffect(() => {
        // Set initial state
        const initialScrollY = window.scrollY;
        setState({
            isScrolled: initialScrollY > threshold,
            isVisible: true,
            scrollY: initialScrollY,
            scrollDirection: null,
        });
        lastScrollY.current = initialScrollY;
        lastVisibleScrollY.current = initialScrollY;

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll, threshold]);

    return state;
}

export default useScrollNavbar;
