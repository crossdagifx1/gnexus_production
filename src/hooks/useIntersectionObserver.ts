import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
    freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
    options: UseIntersectionObserverOptions = {}
): [(node: Element | null) => void, boolean, IntersectionObserverEntry | null] {
    const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;

    const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const frozen = useRef(false);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const elementRef = useRef<Element | null>(null);

    const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
        setEntry(entry);
        setIsVisible(entry.isIntersecting);

        if (freezeOnceVisible && entry.isIntersecting) {
            frozen.current = true;
            if (observerRef.current && elementRef.current) {
                observerRef.current.unobserve(elementRef.current);
            }
        }
    };

    const setElement = (node: Element | null) => {
        if (frozen.current) return;

        if (observerRef.current && elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
        }

        elementRef.current = node;

        if (!node) return;

        observerRef.current = new IntersectionObserver(updateEntry, {
            threshold,
            root,
            rootMargin,
        });

        observerRef.current.observe(node);
    };

    useEffect(() => {
        return () => {
            if (observerRef.current && elementRef.current) {
                observerRef.current.unobserve(elementRef.current);
            }
        };
    }, []);

    return [setElement, isVisible, entry];
}
