import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveCardProps {
    children: React.ReactNode;
    hover?: 'lift' | 'glow' | 'tilt' | 'scale';
    onClick?: () => void;
    className?: string;
    glowColor?: 'gold' | 'cyan';
}

/**
 * InteractiveCard Component
 * 
 * A card with advanced hover interactions including 3D tilt effect.
 * 
 * @param hover - Type of hover effect ('lift' | 'glow' | 'tilt' | 'scale')
 * @param glowColor - Color of glow effect
 * @param onClick - Click handler for interactive cards
 * 
 * @example
 * <InteractiveCard hover="tilt" glowColor="gold">
 *   <h3>Hover over me!</h3>
 *   <p>I'll tilt in 3D</p>
 * </InteractiveCard>
 */
export const InteractiveCard: React.FC<InteractiveCardProps> = ({
    children,
    hover = 'lift',
    onClick,
    className,
    glowColor,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hover !== 'tilt' || !cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXValue = ((y - centerY) / centerY) * -10;
        const rotateYValue = ((x - centerX) / centerX) * 10;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        if (hover === 'tilt') {
            setRotateX(0);
            setRotateY(0);
        }
    };

    const hoverStyles = {
        lift: 'hover:-translate-y-2 hover:shadow-xl',
        glow: glowColor === 'gold' ? 'hover:shadow-[0_0_30px_rgba(245,166,35,0.5)]' : 'hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]',
        tilt: 'transform-gpu',
        scale: 'hover:scale-105',
    };

    const tiltTransform = hover === 'tilt'
        ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        : undefined;

    return (
        <div
            ref={cardRef}
            className={cn(
                'rounded-xl bg-surface border border-border-color p-6',
                'transition-all duration-300 ease-out',
                onClick && 'cursor-pointer',
                hoverStyles[hover],
                className
            )}
            style={{
                transform: tiltTransform,
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            <div style={{ transform: 'translateZ(20px)' }}>
                {children}
            </div>
        </div>
    );
};

export default InteractiveCard;
