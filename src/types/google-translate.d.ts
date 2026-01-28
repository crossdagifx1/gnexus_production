// TypeScript definitions for Google Translate API

export interface GoogleTranslateElement {
    InlineLayout: {
        SIMPLE: number;
        HORIZONTAL: number;
        VERTICAL: number;
    };
}

export interface GoogleTranslateOptions {
    pageLanguage: string;
    includedLanguages?: string;
    layout?: number;
    autoDisplay?: boolean;
    multilanguagePage?: boolean;
}

export interface GoogleTranslate {
    TranslateElement: {
        new(options: GoogleTranslateOptions, elementId: string): void;
        InlineLayout: GoogleTranslateElement['InlineLayout'];
    };
}

declare global {
    interface Window {
        google?: {
            translate?: GoogleTranslate;
        };
        googleTranslateElementInit?: () => void;
    }
}

export { };
