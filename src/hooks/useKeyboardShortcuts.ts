/**
 * useKeyboardShortcuts Hook
 * Global keyboard shortcuts for the chat interface
 */

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    description: string;
    action: () => void;
    enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
    preventDefault?: boolean;
}

export function useKeyboardShortcuts({
    shortcuts,
    enabled = true,
    preventDefault = true,
}: UseKeyboardShortcutsOptions) {
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in input/textarea
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        // Allow some shortcuts even in input (like Ctrl+K to open command palette)
        const alwaysAllowed = ['k', '/'].includes(e.key.toLowerCase());

        if (isInput && !alwaysAllowed) return;

        for (const shortcut of shortcutsRef.current) {
            if (shortcut.enabled === false) continue;

            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
            const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
            const metaMatch = shortcut.meta ? e.metaKey : true;
            const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
            const altMatch = shortcut.alt ? e.altKey : !e.altKey;

            if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
                if (preventDefault) {
                    e.preventDefault();
                }
                shortcut.action();
                return;
            }
        }
    }, [enabled, preventDefault]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

// Default chat shortcuts
export function getDefaultChatShortcuts(options: {
    onNewChat: () => void;
    onSearch: () => void;
    onCommandPalette: () => void;
    onTogglePin: () => void;
    onSettings: () => void;
    onVoiceInput: () => void;
}): KeyboardShortcut[] {
    return [
        {
            key: 'k',
            ctrl: true,
            description: 'Open command palette',
            action: options.onCommandPalette,
        },
        {
            key: 'n',
            ctrl: true,
            description: 'Start new chat',
            action: options.onNewChat,
        },
        {
            key: 'f',
            ctrl: true,
            description: 'Search in chat',
            action: options.onSearch,
        },
        {
            key: 'p',
            ctrl: true,
            shift: true,
            description: 'Toggle pin session',
            action: options.onTogglePin,
        },
        {
            key: ',',
            ctrl: true,
            description: 'Open settings',
            action: options.onSettings,
        },
        {
            key: '/',
            description: 'Show keyboard shortcuts',
            action: options.onCommandPalette,
        },
        {
            key: 'v',
            ctrl: true,
            description: 'Toggle voice input',
            action: options.onVoiceInput,
        },
        {
            key: 'Escape',
            description: 'Close modals/panels',
            action: () => {
                // This will be handled by the components themselves
                document.dispatchEvent(new CustomEvent('close-modals'));
            },
        },
    ];
}

// Shortcuts display component data
export const shortcutCategories = [
    {
        name: 'Navigation',
        shortcuts: [
            { key: 'Ctrl + K', description: 'Open command palette' },
            { key: 'Ctrl + N', description: 'New chat' },
            { key: 'Ctrl + F', description: 'Search' },
            { key: 'Ctrl + /', description: 'Show all shortcuts' },
        ],
    },
    {
        name: 'Chat',
        shortcuts: [
            { key: 'Ctrl + Enter', description: 'Send message' },
            { key: 'Ctrl + V', description: 'Toggle voice input' },
            { key: 'Tab', description: 'Add indentation' },
            { key: 'Shift + Enter', description: 'New line' },
        ],
    },
    {
        name: 'Session',
        shortcuts: [
            { key: 'Ctrl + Shift + P', description: 'Pin/unpin session' },
            { key: 'Ctrl + S', description: 'Save/export chat' },
            { key: 'Ctrl + D', description: 'Duplicate session' },
        ],
    },
    {
        name: 'General',
        shortcuts: [
            { key: 'Ctrl + ,', description: 'Open settings' },
            { key: 'Escape', description: 'Close modal/panel' },
        ],
    },
];
