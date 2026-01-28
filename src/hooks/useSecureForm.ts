import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
    rateLimiter,
    createHoneypot,
    isHoneypotFilled,
    generateCSRFToken,
    setCSRFToken,
    getCSRFToken,
    sanitizeInput,
} from '@/lib/security';
import { toast } from 'sonner';

interface SecureFormOptions {
    rateLimit?: {
        maxAttempts: number;
        windowMs: number;
    };
    honeypot?: boolean;
    csrf?: boolean;
    sanitize?: boolean;
}

export const useSecureForm = <TFormData extends Record<string, any>>(
    form: UseFormReturn<TFormData>,
    options: SecureFormOptions = {}
) => {
    const {
        rateLimit = { maxAttempts: 5, windowMs: 60000 }, // 5 attempts per minute
        honeypot = true,
        csrf = true,
        sanitize = true,
    } = options;

    const [honeypotField] = useState(() => honeypot ? createHoneypot() : null);
    const [honeypotValue, setHoneypotValue] = useState('');
    const [csrfToken, setCsrfTokenState] = useState<string>('');
    const [isBlocked, setIsBlocked] = useState(false);

    // Initialize CSRF token
    useEffect(() => {
        if (csrf) {
            let token = getCSRFToken();
            if (!token) {
                token = generateCSRFToken();
                setCSRFToken(token);
            }
            setCsrfTokenState(token);
        }
    }, [csrf]);

    // Sanitize form data
    const sanitizeFormData = useCallback(
        (data: TFormData): TFormData => {
            if (!sanitize) return data;

            const sanitized: Record<string, any> = { ...data };
            Object.keys(sanitized).forEach((key) => {
                const value = sanitized[key];
                if (typeof value === 'string') {
                    sanitized[key] = sanitizeInput(value);
                }
            });
            return sanitized as TFormData;
        },
        [sanitize]
    );

    // Validate submission
    const validateSubmission = useCallback(
        (formId: string): boolean => {
            // Check honeypot
            if (honeypot && isHoneypotFilled(honeypotValue)) {
                console.warn('Bot detected via honeypot');
                return false;
            }

            // Check rate limit
            if (!rateLimiter.isAllowed(formId, rateLimit.maxAttempts, rateLimit.windowMs)) {
                setIsBlocked(true);
                toast.error('Too many attempts. Please try again later.');
                return false;
            }

            // Check CSRF token
            if (csrf && csrfToken !== getCSRFToken()) {
                console.error('CSRF token mismatch');
                toast.error('Security validation failed. Please refresh the page.');
                return false;
            }

            return true;
        },
        [honeypot, honeypotValue, csrf, csrfToken, rateLimit]
    );

    // Secure submit handler
    const createSecureSubmitHandler = useCallback(
        (formId: string, onSubmit: (data: TFormData) => Promise<void> | void) => {
            return async (data: TFormData) => {
                // Validate submission
                if (!validateSubmission(formId)) {
                    return;
                }

                // Sanitize data
                const sanitizedData = sanitizeFormData(data);

                try {
                    await onSubmit(sanitizedData);
                } catch (error) {
                    console.error('Form submission error:', error);
                    toast.error('An error occurred. Please try again.');
                }
            };
        },
        [validateSubmission, sanitizeFormData]
    );

    return {
        honeypotField,
        honeypotValue,
        setHoneypotValue,
        csrfToken,
        isBlocked,
        createSecureSubmitHandler,
        validateSubmission,
        sanitizeFormData,
    };
};

// Honeypot component to render in forms
export const HoneypotField = ({
    fieldName,
    fieldId,
    value,
    onChange,
}: {
    fieldName: string;
    fieldId: string;
    value: string;
    onChange: (value: string) => void;
}) => {
    return (
        <div style= {{ position: 'absolute', left: '-9999px', opacity: 0 }
} aria-hidden="true" >
    <label htmlFor={ fieldId }>
        Please leave this field blank
            </label>
            < input
type = "text"
name = { fieldName }
id = { fieldId }
value = { value }
onChange = {(e) => onChange(e.target.value)}
tabIndex = {- 1}
autoComplete = "off"
    />
    </div>
  );
};
