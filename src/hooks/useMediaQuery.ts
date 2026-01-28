import { useEffect, useState } from 'react';

type MediaQueryValue = boolean;

/**
 * Hook for responsive media queries with SSR support
 */
export function useMediaQuery(query: string): MediaQueryValue {
    const [matches, setMatches] = useState<MediaQueryValue>(false);

    useEffect(() => {
        // Check if window is defined (client-side)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Create event listener
        const handleChange = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        // Fallback for older browsers
        else {
            // @ts-ignore - deprecated but needed for older browsers
            mediaQuery.addListener(handleChange);
            // @ts-ignore
            return () => mediaQuery.removeListener(handleChange);
        }
    }, [query]);

    return matches;
}

// Convenience hooks for common breakpoints
export function useIsMobile() {
    return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
    return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
    return useMediaQuery('(min-width: 1025px)');
}

export function usePrefersReducedMotion() {
    return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDark() {
    return useMediaQuery('(prefers-color-scheme: dark)');
}
