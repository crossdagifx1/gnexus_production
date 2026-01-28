import { ReactNode, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface MicroInteractionProps {
    children: ReactNode;
    type?: 'lift' | 'tilt' | 'ripple' | 'magnetic' | 'bounce' | 'scale';
    intensity?: 'subtle' | 'normal' | 'strong';
    className?: string;
}

export function MicroInteraction({
    children,
    type = 'lift',
    intensity = 'normal',
    className = '',
}: MicroInteractionProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5, freezeOnceVisible: true });
    const elementRef = useRef<HTMLDivElement>(null);

    const intensityMap = {
        subtle: { lift: 2, scale: 1.02, tilt: 2, magnetic: 0.05 },
        normal: { lift: 4, scale: 1.05, tilt: 5, magnetic: 0.1 },
        strong: { lift: 8, scale: 1.1, tilt: 10, magnetic: 0.15 },
    };

    useEffect(() => {
        if (prefersReducedMotion || !elementRef.current) return;

        const element = elementRef.current;

        if (type === 'magnetic') {
            const handleMouseMove = (e: MouseEvent) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const distance = Math.sqrt(x * x + y * y);
                const maxDistance = Math.max(rect.width, rect.height);

                if (distance < maxDistance) {
                    const magneticStrength = intensityMap[intensity].magnetic;
                    element.style.transform = `translate(${x * magneticStrength}px, ${y * magneticStrength}px)`;
                }
            };

            const handleMouseLeave = () => {
                element.style.transform = '';
            };

            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('mouseleave', handleMouseLeave);
            };
        }

        if (type === 'tilt') {
            const handleMouseMove = (e: MouseEvent) => {
                const rect = element.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const tiltX = (y - 0.5) * intensityMap[intensity].tilt * 2;
                const tiltY = (x - 0.5) * -intensityMap[intensity].tilt * 2;

                element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
            };

            const handleMouseLeave = () => {
                element.style.transform = '';
            };

            element.addEventListener('mousemove', handleMouseMove);
            element.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                element.removeEventListener('mousemove', handleMouseMove);
                element.removeEventListener('mouseleave', handleMouseLeave);
            };
        }

        if (type === 'ripple') {
            const handleClick = (e: MouseEvent) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          width: 10px;
          height: 10px;
          left: ${x}px;
          top: ${y}px;
          transform: translate(-50%, -50%);
          animation: ripple-effect 0.6s ease-out;
          pointer-events: none;
        `;

                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                element.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            };

            element.addEventListener('click', handleClick);
            return () => element.removeEventListener('click', handleClick);
        }
    }, [type, intensity, prefersReducedMotion]);

    const typeClasses = {
        lift: 'interactive-lift',
        tilt: 'interactive-tilt',
        ripple: 'cursor-pointer',
        magnetic: 'cursor-pointer transition-transform duration-200',
        bounce: 'hover:animate-bounce-subtle',
        scale: `hover:scale-${intensity === 'subtle' ? '102' : intensity === 'normal' ? '105' : '110'
            } transition-transform duration-300`,
    };

    return (
        <div
            ref={(node) => {
                elementRef.current = node;
                ref(node);
            }}
            className={`${typeClasses[type]} ${className} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        >
            {children}
            <style>{`
        @keyframes ripple-effect {
          to {
            width: 500px;
            height: 500px;
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}
