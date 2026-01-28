import { useEffect, useRef } from 'react';

interface UseA11yOptions {
    announcePageChange?: boolean;
    reducedMotion?: boolean;
}

// Screen reader announcements
export const useScreenReader = () => {
    const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    };

    return { announce };
};

// Focus management
export const useFocusManagement = () => {
    const focusRef = useRef<HTMLElement | null>(null);

    const setFocus = (element: HTMLElement | null) => {
        focusRef.current = element;
        element?.focus();
    };

    const restoreFocus = () => {
        focusRef.current?.focus();
    };

    const trapFocus = (container: HTMLElement) => {
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    };

    return { setFocus, restoreFocus, trapFocus };
};

// Reduced motion preference
export const useReducedMotion = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    useEffect(() => {
        if (prefersReducedMotion.matches) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
    }, [prefersReducedMotion]);

    return prefersReducedMotion.matches;
};

// High contrast mode
export const useHighContrast = () => {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: more)');

    useEffect(() => {
        if (prefersHighContrast.matches) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [prefersHighContrast]);

    return prefersHighContrast.matches;
};

// Comprehensive accessibility hook
export const useA11y = (options: UseA11yOptions = {}) => {
    const { announcePageChange = true, reducedMotion = true } = options;
    const { announce } = useScreenReader();
    const focusManagement = useFocusManagement();
    const prefersReducedMotion = reducedMotion ? useReducedMotion() : false;
    const prefersHighContrast = useHighContrast();

    // Announce page changes
    useEffect(() => {
        if (announcePageChange) {
            const title = document.title;
            announce(`Navigated to ${title}`, 'polite');
        }
    }, [announcePageChange, announce]);

    return {
        announce,
        ...focusManagement,
        prefersReducedMotion,
        prefersHighContrast,
    };
};

// Keyboard shortcuts hook
export const useKeyboardShortcuts = (
    shortcuts: Record<string, (e: KeyboardEvent) => void>
) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const modifiers = [
                e.ctrlKey && 'ctrl',
                e.shiftKey && 'shift',
                e.altKey && 'alt',
                e.metaKey && 'meta',
            ]
                .filter(Boolean)
                .join('+');

            const shortcutKey = modifiers ? `${modifiers}+${key}` : key;

            if (shortcuts[shortcutKey]) {
                e.preventDefault();
                shortcuts[shortcutKey](e);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
