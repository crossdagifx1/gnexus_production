import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
    children: ReactNode;
    smoothness?: number;
    enabled?: boolean;
}

export const SmoothScroll = ({
    children,
    smoothness = 1.2,
    enabled = true
}: SmoothScrollProps) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled || !scrollerRef.current || !contentRef.current) return;

        let ctx: gsap.Context;
        let scrollTween: gsap.core.Tween | null = null;
        let currentScroll = 0;
        let targetScroll = 0;
        let ease = 0.1;

        const updateScroll = () => {
            if (!contentRef.current) return;

            targetScroll = window.scrollY;
            currentScroll += (targetScroll - currentScroll) * ease;

            // Update transform
            gsap.set(contentRef.current, {
                y: -currentScroll,
                force3D: true,
            });

            scrollTween = gsap.to({}, {
                duration: 0.016,
                onComplete: updateScroll,
            });
        };

        ctx = gsap.context(() => {
            // Set up the container
            if (scrollerRef.current && contentRef.current) {
                const height = contentRef.current.offsetHeight;
                document.body.style.height = `${height}px`;

                // Start the smooth scroll loop
                updateScroll();
            }

            // Refresh ScrollTrigger when window resizes
            ScrollTrigger.addEventListener('refresh', () => {
                if (contentRef.current) {
                    const height = contentRef.current.offsetHeight;
                    document.body.style.height = `${height}px`;
                }
            });
        });

        // Handle resize
        const handleResize = () => {
            if (contentRef.current) {
                const height = contentRef.current.offsetHeight;
                document.body.style.height = `${height}px`;
                ScrollTrigger.refresh();
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (scrollTween) scrollTween.kill();
            document.body.style.height = '';
            window.removeEventListener('resize', handleResize);
            ctx?.revert();
        };
    }, [enabled, smoothness]);

    if (!enabled) {
        return <>{children}</>;
    }

    return (
        <div ref={scrollerRef} className="fixed top-0 left-0 w-full overflow-hidden">
            <div ref={contentRef} className="will-change-transform">
                {children}
            </div>
        </div>
    );
};

// Lightweight version using CSS smooth scroll for better compatibility
export const SimpleSmoothScroll = ({ children }: { children: ReactNode }) => {
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';

        return () => {
            document.documentElement.style.scrollBehavior = '';
        };
    }, []);

    return <>{children}</>;
};
