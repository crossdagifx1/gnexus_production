import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
import commonEN from './locales/en/common.json';
import homeEN from './locales/en/home.json';
import servicesEN from './locales/en/services.json';

// Amharic translations
import commonAM from './locales/am/common.json';
import homeAM from './locales/am/home.json';
import servicesAM from './locales/am/services.json';

const resources = {
    en: {
        common: commonEN,
        home: homeEN,
        services: servicesEN,
    },
    am: {
        common: commonAM,
        home: homeAM,
        services: servicesAM,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        defaultNS: 'common',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
