import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const useGoogleTranslate = () => {
    const location = useLocation();

    // Restore translation on route change
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && savedLanguage !== 'en') {
            // Delay to ensure new page content is rendered
            const timer = setTimeout(() => {
                restoreTranslation(savedLanguage);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [location.pathname]);

    const restoreTranslation = (languageCode: string) => {
        const maxAttempts = 20;
        let attempts = 0;

        const tryRestore = setInterval(() => {
            attempts++;

            if (window.google?.translate) {
                const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                if (select) {
                    const googleLangCode = languageCode === 'en' ? '' : languageCode;
                    if (select.value !== googleLangCode) {
                        select.value = googleLangCode;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    clearInterval(tryRestore);
                }
            }

            if (attempts >= maxAttempts) {
                clearInterval(tryRestore);
            }
        }, 200);
    };

    const changeLanguage = useCallback((languageCode: string) => {
        console.log('Changing language to:', languageCode);

        const maxAttempts = 30;
        let attempts = 0;

        const tryChange = setInterval(() => {
            attempts++;

            if (window.google?.translate) {
                const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;

                if (select) {
                    const googleLangCode = languageCode === 'en' ? '' : languageCode;
                    console.log('Setting Google Translate to:', googleLangCode);

                    select.value = googleLangCode;
                    select.dispatchEvent(new Event('change', { bubbles: true }));

                    clearInterval(tryChange);
                    console.log('Language changed successfully');
                } else {
                    console.log('Waiting for Google Translate select element...', attempts);
                }
            } else {
                console.log('Waiting for Google Translate to load...', attempts);
            }

            if (attempts >= maxAttempts) {
                console.error('Google Translate failed to load after', maxAttempts, 'attempts');
                clearInterval(tryChange);
            }
        }, 200);
    }, []);

    const isGoogleTranslateLoaded = useCallback(() => {
        return !!(window.google?.translate);
    }, []);

    return {
        changeLanguage,
        isGoogleTranslateLoaded,
    };
};
