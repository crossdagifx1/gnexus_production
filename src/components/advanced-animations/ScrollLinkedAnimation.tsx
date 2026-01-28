import { ReactNode, useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface ScrollLinkedAnimationProps {
    children: ReactNode;
    type?: 'parallax' | 'reveal' | 'fade' | 'scale' | 'rotate' | 'blur';
    speed?: 'slow' | 'normal' | 'fast';
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
    startOpacity?: number;
    endOpacity?: number;
}

export function ScrollLinkedAnimation({
    children,
    type = 'fade',
    speed = 'normal',
    direction = 'up',
    className = '',
    startOpacity = 0,
    endOpacity = 1,
}: ScrollLinkedAnimationProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [ref, isVisible, entry] = useIntersectionObserver({ threshold: 0.1 });
    const elementRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        if (prefersReducedMotion || !isVisible) return;

        const handleScroll = () => {
            if (!entry || !elementRef.current) return;

            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;

            // Calculate scroll progress (0 to 1)
            const elementTop = rect.top;
            const elementHeight = rect.height;
            const scrolled = windowHeight - elementTop;
            const progress = Math.min(Math.max(scrolled / (windowHeight + elementHeight), 0), 1);

            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isVisible, entry, prefersReducedMotion]);

    const speedMultiplier = speed === 'slow' ? 0.3 : speed === 'fast' ? 0.6 : 0.4;

    const getTransform = () => {
        if (prefersReducedMotion) return '';

        const progress = scrollProgress;
        const movement = progress * 100 * speedMultiplier;

        switch (type) {
            case 'parallax':
                return direction === 'up'
                    ? `translateY(${movement}px)`
                    : direction === 'down'
                        ? `translateY(-${movement}px)`
                        : direction === 'left'
                            ? `translateX(${movement}px)`
                            : `translateX(-${movement}px)`;

            case 'reveal':
                const distance = 50;
                const revealProgress = Math.min(progress * 1.5, 1);
                return direction === 'up'
                    ? `translateY(${(1 - revealProgress) * distance}px)`
                    : direction === 'down'
                        ? `translateY(-${(1 - revealProgress) * distance}px)`
                        : direction === 'left'
                            ? `translateX(${(1 - revealProgress) * distance}px)`
                            : `translateX(-${(1 - revealProgress) * distance}px)`;

            case 'scale':
                const scale = 0.8 + (progress * 0.2);
                return `scale(${scale})`;

            case 'rotate':
                const rotation = progress * 180;
                return `rotate(${rotation}deg)`;

            default:
                return '';
        }
    };

    const getOpacity = () => {
        if (prefersReducedMotion) return 1;
        if (type === 'fade' || type === 'reveal') {
            return startOpacity + (endOpacity - startOpacity) * scrollProgress;
        }
        return 1;
    };

    const getBlur = () => {
        if (prefersReducedMotion || type !== 'blur') return '';
        const blurAmount = Math.max(0, (1 - scrollProgress) * 10);
        return `blur(${blurAmount}px)`;
    };

    return (
        <div
            ref={(node) => {
                elementRef.current = node;
                ref(node);
            }}
            className={className}
            style={{
                transform: getTransform(),
                opacity: getOpacity(),
                filter: getBlur(),
                transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out, opacity 0.3s ease-out',
            }}
        >
            {children}
        </div>
    );
}
