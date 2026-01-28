import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. This ensures every page starts from the header.
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top instantly when route changes
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' as ScrollBehavior,
        });
    }, [pathname]);

    return null;
}
