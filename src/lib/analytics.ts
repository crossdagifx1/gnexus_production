import ReactGA from 'react-ga4';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const isProduction = import.meta.env.PROD;
const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';

// Initialize Google Analytics
export const initGA = () => {
    if (analyticsEnabled && MEASUREMENT_ID && isProduction) {
        ReactGA.initialize(MEASUREMENT_ID, {
            gaOptions: {
                anonymize_ip: true,
            },
        });
    }
};

// Track page views
export const trackPageView = (path: string) => {
    if (analyticsEnabled && isProduction) {
        ReactGA.send({ hitType: 'pageview', page: path });
    }
};

// Track custom events
export const trackEvent = (
    category: string,
    action: string,
    label?: string,
    value?: number
) => {
    if (analyticsEnabled && isProduction) {
        ReactGA.event({
            category,
            action,
            label,
            value,
        });
    }
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
    trackEvent('Button', 'click', `${buttonName} - ${location}`);
};

// Track form submissions
export const trackFormSubmit = (formName: string, success: boolean) => {
    trackEvent('Form', 'submit', formName, success ? 1 : 0);
};

// Track language change
export const trackLanguageChange = (newLanguage: string) => {
    trackEvent('Settings', 'language_change', newLanguage);
};

// Track PWA install
export const trackPWAInstall = (action: 'prompt' | 'accepted' | 'dismissed') => {
    trackEvent('PWA', 'install', action);
};
