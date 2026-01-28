import React, { useEffect } from 'react';

interface SkipToContentProps {
    mainContentId?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
    mainContentId = 'main-content',
}) => {
    useEffect(() => {
        // Add ID to main element if it doesn't exist
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = mainContentId;
        }
    }, [mainContentId]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const mainContent = document.getElementById(mainContentId);
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <a
            href={`#${mainContentId}`}
            onClick={handleClick}
            className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[100]
        bg-primary text-primary-foreground
        px-4 py-2 rounded-md
        font-medium
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        transition-all
      "
        >
            Skip to main content
        </a>
    );
};

// Keyboard shortcuts legend component
export const KeyboardShortcuts: React.FC = () => {
    const shortcuts = [
        { key: '/', description: 'Focus search' },
        { key: 'Esc', description: 'Close dialog/menu' },
        { key: 'Tab', description: 'Navigate forward' },
        { key: 'Shift + Tab', description: 'Navigate backward' },
        { key: 'Enter', description: 'Activate button/link' },
    ];

    return (
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
            <dl className="space-y-1 text-sm">
                {shortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex justify-between gap-4">
                        <dt className="flex gap-1">
                            {shortcut.key.split(' ').map((k, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 && <span className="text-muted-foreground">+</span>}
                                    <kbd className="px-2 py-0.5 rounded bg-background border text-xs font-mono">
                                        {k}
                                    </kbd>
                                </React.Fragment>
                            ))}
                        </dt>
                        <dd className="text-muted-foreground">{shortcut.description}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};
