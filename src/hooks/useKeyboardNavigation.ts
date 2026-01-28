import { useEffect, useState } from 'react';

type KeyboardKey = string;
type KeyboardHandler = (event: KeyboardEvent) => void;

interface KeyboardNavigationOptions {
    keys: KeyboardKey[];
    onKeyPress?: KeyboardHandler;
    preventDefault?: boolean;
    allowWhenInputFocused?: boolean;
}

/**
 * Hook for advanced keyboard navigation patterns
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
    const { keys, onKeyPress, preventDefault = true, allowWhenInputFocused = false } = options;
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if focus is on an input element
            const activeElement = document.activeElement;
            const isInputFocused =
                activeElement?.tagName === 'INPUT' ||
                activeElement?.tagName === 'TEXTAREA' ||
                activeElement?.getAttribute('contenteditable') === 'true';

            if (isInputFocused && !allowWhenInputFocused) return;

            const key = event.key.toLowerCase();
            if (keys.includes(key)) {
                if (preventDefault) {
                    event.preventDefault();
                }
                setPressedKeys((prev) => new Set(prev).add(key));
                onKeyPress?.(event);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            setPressedKeys((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [keys, onKeyPress, preventDefault, allowWhenInputFocused]);

    return {
        pressedKeys: Array.from(pressedKeys),
        isKeyPressed: (key: string) => pressedKeys.has(key.toLowerCase()),
    };
}

/**
 * Hook for detecting common keyboard shortcuts
 */
export function useKeyboardShortcut(
    shortcut: string,
    callback: () => void,
    options?: { preventDefault?: boolean }
) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const keys = shortcut.toLowerCase().split('+');
            const pressed = [
                event.ctrlKey && 'ctrl',
                event.metaKey && 'meta',
                event.altKey && 'alt',
                event.shiftKey && 'shift',
                event.key.toLowerCase(),
            ].filter(Boolean);

            const matches = keys.every((key) => pressed.includes(key));

            if (matches) {
                if (options?.preventDefault !== false) {
                    event.preventDefault();
                }
                callback();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcut, callback, options]);
}

/**
 * Hook for focus trap (useful for modals and dialogs)
 */
export function useFocusTrap(isActive: boolean) {
    useEffect(() => {
        if (!isActive) return;

        const focusableElements = document.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTabKey);
        firstElement?.focus();

        return () => document.removeEventListener('keydown', handleTabKey);
    }, [isActive]);
}
