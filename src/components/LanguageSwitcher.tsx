import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

/**
 * LanguageSwitcher Component
 * 
 * Displays a Google Translate icon button that triggers the external
 * Google Translate widget when clicked.
 */
export const LanguageSwitcher = () => {
    const handleTranslateClick = () => {
        // Find the Google Translate select element
        const translateSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;

        if (translateSelect) {
            // Trigger a click event to open the Google Translate dropdown
            translateSelect.focus();
            translateSelect.click();

            // Alternative: Programmatically open the dropdown
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            translateSelect.dispatchEvent(event);
        } else {
            // If the widget isn't loaded yet, scroll to it or make it visible
            const translateElement = document.getElementById('google_translate_element');
            if (translateElement) {
                // Temporarily make it visible and positioned on screen
                translateElement.style.position = 'fixed';
                translateElement.style.top = '60px';
                translateElement.style.right = '20px';
                translateElement.style.zIndex = '9999';

                // Wait a bit for the widget to render, then click
                setTimeout(() => {
                    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                    if (select) {
                        select.focus();
                        select.click();
                    }
                }, 100);
            }
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleTranslateClick}
            className="gap-2"
            title="Translate Page"
        >
            <Languages className="w-4 h-4" />
        </Button>
    );
};
