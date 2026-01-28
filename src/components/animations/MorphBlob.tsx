import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface MorphBlobProps {
    className?: string;
    colors?: string[];
    duration?: number;
}

export const MorphBlob = ({
    className = '',
    colors = ['hsla(var(--gold), 0.2)', 'hsla(var(--cyan), 0.15)'],
    duration = 8,
}: MorphBlobProps) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const path = svgRef.current.querySelector('path');
        if (!path) return;

        // Define multiple blob paths for morphing
        const paths = [
            'M60,-65.9C75.7,-54.6,85.3,-32.8,86.2,-11.4C87.1,10,79.3,31,66.2,48.3C53.1,65.6,34.7,79.1,14.8,83.9C-5.1,88.7,-26.5,84.7,-43.1,73.1C-59.7,61.5,-71.5,42.2,-75.8,21.4C-80.1,0.6,-77,-21.7,-67.3,-39.1C-57.6,-56.5,-41.3,-69,-23.5,-78.1C-5.6,-87.2,11.8,-92.9,27.3,-88.5C42.8,-84.1,56.5,-69.6,60,-65.9Z',
            'M52.4,-62.3C66.5,-51.1,75.5,-32.4,78.1,-13C80.7,6.4,76.9,26.5,66.8,41.8C56.7,57.1,40.3,67.6,22.3,72.5C4.3,77.4,-15.3,76.7,-32.1,69.4C-48.9,62.1,-62.9,48.2,-70.3,31.4C-77.7,14.6,-78.5,-5.1,-73.1,-22.9C-67.7,-40.7,-56.1,-56.6,-41.3,-67.6C-26.5,-78.6,-9.5,-84.7,5.9,-82.2C21.3,-79.7,42.6,-68.6,52.4,-62.3Z',
            'M48.7,-56.5C62.1,-45.3,71.5,-28.9,74.2,-11.3C76.9,6.3,72.9,25.1,63.1,40.1C53.3,55.1,37.7,66.3,20.5,71.3C3.3,76.3,-15.5,75.1,-31.6,67.9C-47.7,60.7,-61.1,47.5,-67.9,31.2C-74.7,14.9,-74.9,-4.6,-69.1,-21.7C-63.3,-38.8,-51.5,-53.5,-37.4,-64.5C-23.3,-75.5,-7.8,-82.8,6.3,-90.2C20.4,-97.6,40.8,-105.1,48.7,-56.5Z',
            'M56.3,-63.8C71.5,-52.6,82.1,-33.3,84.3,-13.3C86.5,6.7,80.3,27.4,68.9,43.5C57.5,59.6,40.9,71.1,22.7,75.9C4.5,80.7,-15.3,78.8,-33.1,71.1C-50.9,63.4,-66.7,49.9,-74.3,32.8C-81.9,15.7,-81.3,-4.9,-74.5,-23C-67.7,-41.1,-54.7,-56.7,-39,-67.6C-23.3,-78.5,-5,-84.7,10.7,-83.4C26.4,-82.1,52.8,-72.3,56.3,-63.8Z',
        ];

        const tl = gsap.timeline({ repeat: -1 });

        paths.forEach((pathData, index) => {
            tl.to(path, {
                attr: { d: pathData },
                duration,
                ease: 'power1.inOut',
            });
        });

        return () => {
            tl.kill();
        };
    }, [duration]);

    return (
        <svg
            ref={svgRef}
            viewBox="0 0 200 200"
            className={`w-full h-full ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: colors[0] }} />
                    <stop offset="100%" style={{ stopColor: colors[1] }} />
                </linearGradient>
            </defs>
            <path
                d="M60,-65.9C75.7,-54.6,85.3,-32.8,86.2,-11.4C87.1,10,79.3,31,66.2,48.3C53.1,65.6,34.7,79.1,14.8,83.9C-5.1,88.7,-26.5,84.7,-43.1,73.1C-59.7,61.5,-71.5,42.2,-75.8,21.4C-80.1,0.6,-77,-21.7,-67.3,-39.1C-57.6,-56.5,-41.3,-69,-23.5,-78.1C-5.6,-87.2,11.8,-92.9,27.3,-88.5C42.8,-84.1,56.5,-69.6,60,-65.9Z"
                fill="url(#blobGradient)"
                transform="translate(100 100)"
            />
        </svg>
    );
};

// Alternative: Floating blob with position animation
interface FloatingBlobProps {
    className?: string;
    size?: number;
}

export const FloatingBlob = ({
    className = '',
    size = 400,
}: FloatingBlobProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const blob = containerRef.current;

        // Random floating animation
        gsap.to(blob, {
            x: `random(-50, 50)`,
            y: `random(-50, 50)`,
            rotation: `random(-20, 20)`,
            duration: 'random(10, 15)',
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
        });

        return () => {
            gsap.killTweensOf(blob);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`absolute will-change-transform ${className}`}
            style={{ width: size, height: size }}
        >
            <MorphBlob />
        </div>
    );
};
