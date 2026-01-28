import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FloatingNavProps {
    threshold?: number;
    className?: string;
}

export const FloatingNav = ({
    threshold = 100,
    className = ''
}: FloatingNavProps) => {
    const navRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const lastScroll = useRef(0);

    useEffect(() => {
        if (!navRef.current) return;

        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScroll = window.scrollY;
                    const scrollingDown = currentScroll > lastScroll.current;
                    const scrolledPastThreshold = currentScroll > threshold;

                    if (scrolledPastThreshold && !scrollingDown) {
                        // Scrolling up - show nav
                        setIsVisible(true);
                        gsap.to(navRef.current, {
                            y: 0,
                            opacity: 1,
                            duration: 0.3,
                            ease: 'power2.out',
                        });
                    } else if (scrollingDown || !scrolledPastThreshold) {
                        // Scrolling down or at top - hide nav
                        setIsVisible(false);
                        gsap.to(navRef.current, {
                            y: -100,
                            opacity: 0,
                            duration: 0.3,
                            ease: 'power2.in',
                        });
                    }

                    lastScroll.current = currentScroll;
                    ticking = false;
                });

                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return (
        <div
            ref={navRef}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 opacity-0 ${className}`}
            style={{ transform: 'translateX(-50%) translateY(-100px)' }}
        >
            <nav className="px-6 py-3 rounded-full glass border border-gold/20 backdrop-blur-xl shadow-lg">
                <div className="flex items-center gap-6">
                    <a
                        href="#home"
                        className="text-sm text-foreground hover:text-gold transition-colors duration-300"
                    >
                        Home
                    </a>
                    <a
                        href="#services"
                        className="text-sm text-foreground hover:text-gold transition-colors duration-300"
                    >
                        Services
                    </a>
                    <a
                        href="#team"
                        className="text-sm text-foreground hover:text-gold transition-colors duration-300"
                    >
                        Team
                    </a>
                    <a
                        href="#gnexus"
                        className="text-sm text-foreground hover:text-gold transition-colors duration-300"
                    >
                        G-Nexus
                    </a>
                    <a
                        href="#contact"
                        className="text-sm text-foreground hover:text-gold transition-colors duration-300"
                    >
                        Contact
                    </a>
                </div>
            </nav>
        </div>
    );
};
