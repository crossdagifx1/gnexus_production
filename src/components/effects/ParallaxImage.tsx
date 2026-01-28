import { useEffect, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface ParallaxImageProps {
    src: string;
    alt: string;
    speed?: number;
    className?: string;
    objectFit?: 'cover' | 'contain' | 'fill';
}

export function ParallaxImage({
    src,
    alt,
    speed = 0.5,
    className = '',
    objectFit = 'cover',
}: ParallaxImageProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (prefersReducedMotion || !isVisible || !imageRef.current) return;

        const handleScroll = () => {
            if (!imageRef.current) return;

            const rect = imageRef.current.getBoundingClientRect();
            const scrolled = window.scrollY + rect.top;
            const offset = scrolled * speed;

            imageRef.current.style.transform = `translateY(${-offset}px)`;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed, isVisible, prefersReducedMotion]);

    return (
        <div
            ref={(node) => ref(node)}
            className={cn('overflow-hidden relative', className)}
        >
            <div
                ref={imageRef}
                className="will-change-transform"
                style={{
                    height: `${100 + speed * 20}%`,
                    transition: prefersReducedMotion ? 'none' : undefined,
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full"
                    style={{ objectFit }}
                    loading="lazy"
                />
            </div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
