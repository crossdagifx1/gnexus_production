import { useGoogleTranslate } from '@/hooks/useGoogleTranslate';

/**
 * GoogleTranslateInitializer Component
 * 
 * This component initializes Google Translate and ensures translations
 * persist across all page navigations in the React SPA.
 * 
 * It should be placed at the root level of the app (in App.tsx)
 * to monitor route changes globally.
 */
export const GoogleTranslateInitializer = () => {
    useGoogleTranslate();

    // Render the required div for Google Translate widget
    return <div id="google_translate_element" />;
};
