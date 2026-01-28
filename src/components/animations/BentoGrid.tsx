import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BentoGridProps {
    children: ReactNode;
    columns?: number;
    gap?: number;
    className?: string;
}

export const BentoGrid = ({
    children,
    columns = 4,
    gap = 6,
    className = ''
}: BentoGridProps) => {
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gridRef.current) return;

        const ctx = gsap.context(() => {
            const items = gridRef.current?.querySelectorAll('.bento-item');

            if (items) {
                items.forEach((item, index) => {
                    gsap.fromTo(
                        item,
                        {
                            opacity: 0,
                            y: 60,
                            scale: 0.9,
                            rotateX: 10,
                            rotateY: 5,
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotateX: 0,
                            rotateY: 0,
                            duration: 0.8,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: item,
                                start: 'top 90%',
                                toggleActions: 'play none none none',
                            },
                            delay: (index % columns) * 0.1,
                        }
                    );
                });
            }
        }, gridRef);

        return () => ctx.revert();
    }, [columns]);

    return (
        <div
            ref={gridRef}
            className={`grid gap-${gap} ${className}`}
            style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                perspective: '1000px',
            }}
        >
            {children}
        </div>
    );
};

interface BentoItemProps {
    children: ReactNode;
    className?: string;
    span?: number;
    rowSpan?: number;
}

export const BentoItem = ({
    children,
    className = '',
    span = 1,
    rowSpan = 1,
}: BentoItemProps) => {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!itemRef.current) return;

        const item = itemRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const maxRotate = 5;
            const rotateX = -(y / rect.height) * maxRotate;
            const rotateY = (x / rect.width) * maxRotate;

            gsap.to(item, {
                rotateX,
                rotateY,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: 1000,
            });
        };

        const handleMouseLeave = () => {
            gsap.to(item, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out',
            });
        };

        item.addEventListener('mousemove', handleMouseMove);
        item.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            item.removeEventListener('mousemove', handleMouseMove);
            item.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={itemRef}
            className={`bento-item will-change-transform ${className}`}
            style={{
                gridColumn: `span ${span}`,
                gridRow: `span ${rowSpan}`,
                transformStyle: 'preserve-3d',
            }}
        >
            {children}
        </div>
    );
};
