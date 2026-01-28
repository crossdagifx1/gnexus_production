/**
 * Security utilities for the G-Nexus platform
 * Provides XSS prevention, input sanitization, and CSP helpers
 */

// XSS Prevention
export const sanitizeInput = (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

export const sanitizeHTML = (html: string): string => {
    const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'];
    const div = document.createElement('div');
    div.innerHTML = html;

    const walk = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                element.replaceWith(...Array.from(element.childNodes));
                return;
            }

            // Remove dangerous attributes
            const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover'];
            dangerousAttrs.forEach(attr => element.removeAttribute(attr));

            // Sanitize href attributes
            if (element.tagName.toLowerCase() === 'a') {
                const href = element.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('/')) {
                    element.removeAttribute('href');
                }
            }
        }

        Array.from(node.childNodes).forEach(walk);
    };

    walk(div);
    return div.innerHTML;
};

// Content Security Policy Helper
export const generateCSPMeta = (): string => {
    const directives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co https://www.google-analytics.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ];

    return directives.join('; ');
};

// Rate Limiting Helper (Client-Side)
class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const requestTimes = this.requests.get(key) || [];

        // Remove old requests outside the time window
        const validRequests = requestTimes.filter(time => now - time < windowMs);

        if (validRequests.length >= maxRequests) {
            return false;
        }

        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }

    reset(key: string) {
        this.requests.delete(key);
    }
}

export const rateLimiter = new RateLimiter();

// Form Validation Helpers
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
    // Ethiopian phone number format
    const phoneRegex = /^(\+251|0)?[97]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const validateURL = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Password Strength Validator
export const validatePasswordStrength = (password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
} => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Password must be at least 8 characters');

    if (password.length >= 12) score++;

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Include special characters');

    return {
        isStrong: score >= 4,
        score,
        feedback,
    };
};

// CSRF Token Helpers
export const generateCSRFToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const setCSRFToken = (token: string) => {
    sessionStorage.setItem('csrfToken', token);
};

export const getCSRFToken = (): string | null => {
    return sessionStorage.getItem('csrfToken');
};

// Secure Storage Helpers
export const secureStorage = {
    set: (key: string, value: any, encrypt: boolean = false) => {
        const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
        localStorage.setItem(key, data);
    },

    get: (key: string, decrypt: boolean = false): any | null => {
        const data = localStorage.getItem(key);
        if (!data) return null;

        try {
            return decrypt ? JSON.parse(atob(data)) : JSON.parse(data);
        } catch {
            return null;
        }
    },

    remove: (key: string) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    },
};

// Honeypot Field Generator (Bot Detection)
export const createHoneypot = (): {
    fieldName: string;
    fieldId: string;
} => {
    const randomName = `field_${Math.random().toString(36).substring(7)}`;
    return {
        fieldName: randomName,
        fieldId: randomName,
    };
};

export const isHoneypotFilled = (honeypotValue: string): boolean => {
    return honeypotValue.trim() !== '';
};

// Input Masks
export const maskCreditCard = (cardNumber: string): string => {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
};

export const maskEmail = (email: string): string => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
    return `${maskedUsername}@${domain}`;
};

// Security Headers Helper (for server-side use)
export const getSecurityHeaders = () => ({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': generateCSPMeta(),
});
