import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface MeshGradientProps {
    colors?: string[];
    className?: string;
    speed?: number;
}

export const MeshGradient = ({
    colors = [
        'hsla(var(--gold), 0.15)',
        'hsla(var(--cyan), 0.1)',
        'hsla(var(--gold-glow), 0.12)',
    ],
    className = '',
    speed = 20
}: MeshGradientProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const orb1Ref = useRef<HTMLDivElement>(null);
    const orb2Ref = useRef<HTMLDivElement>(null);
    const orb3Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = gsap.context(() => {
            // Animate orb 1 - slow circular motion
            gsap.to(orb1Ref.current, {
                x: '20vw',
                y: '-15vh',
                duration: speed,
                ease: 'none',
                repeat: -1,
                yoyo: true,
            });

            gsap.to(orb1Ref.current, {
                rotation: 360,
                duration: speed * 2,
                ease: 'none',
                repeat: -1,
            });

            // Animate orb 2 - figure-8 pattern
            gsap.to(orb2Ref.current, {
                x: '-15vw',
                y: '20vh',
                duration: speed * 1.3,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });

            gsap.to(orb2Ref.current, {
                scale: 1.2,
                duration: speed * 0.8,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });

            // Animate orb 3 - diagonal drift
            gsap.to(orb3Ref.current, {
                x: '10vw',
                y: '10vh',
                duration: speed * 1.5,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true,
            });

            // Subtle opacity pulse on all orbs
            [orb1Ref, orb2Ref, orb3Ref].forEach((orb, i) => {
                gsap.to(orb.current, {
                    opacity: 0.6,
                    duration: speed * 0.5 * (i + 1),
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                });
            });
        }, canvasRef);

        return () => ctx.revert();
    }, [speed]);

    return (
        <div
            ref={canvasRef}
            className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
            style={{ filter: 'blur(80px)' }}
        >
            {/* Gradient Orb 1 */}
            <div
                ref={orb1Ref}
                className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full will-change-transform"
                style={{
                    background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
                }}
            />

            {/* Gradient Orb 2 */}
            <div
                ref={orb2Ref}
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full will-change-transform"
                style={{
                    background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`,
                }}
            />

            {/* Gradient Orb 3 */}
            <div
                ref={orb3Ref}
                className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full will-change-transform"
                style={{
                    background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`,
                }}
            />
        </div>
    );
};
