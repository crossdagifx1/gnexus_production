import { useEffect, useState } from 'react';

/**
 * Hook for intelligent prefetching based on user behavior
 * Prefetches routes/resources when user is likely to navigate to them
 */
export function usePrefetch() {
    const [prefetched, setPrefetched] = useState<Set<string>>(new Set());

    const prefetchRoute = (route: string) => {
        if (prefetched.has(route)) return;

        // Use browser's link prefetch
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);

        setPrefetched((prev) => new Set(prev).add(route));
    };

    const prefetchOnHover = (route: string) => {
        return {
            onMouseEnter: () => prefetchRoute(route),
            onTouchStart: () => prefetchRoute(route),
        };
    };

    const prefetchOnVisible = (route: string, threshold = 0.5) => {
        return (element: HTMLElement | null) => {
            if (!element) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        prefetchRoute(route);
                        observer.disconnect();
                    }
                },
                { threshold }
            );

            observer.observe(element);
        };
    };

    return {
        prefetchRoute,
        prefetchOnHover,
        prefetchOnVisible,
        prefetched: Array.from(prefetched),
    };
}
