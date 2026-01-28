import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TextShimmerProps {
    children: ReactNode;
    className?: string;
    speed?: 'slow' | 'normal' | 'fast';
    colors?: 'gold' | 'cyan' | 'rainbow';
}

export function TextShimmer({
    children,
    className = '',
    speed = 'normal',
    colors = 'gold',
}: TextShimmerProps) {
    const speedClasses = {
        slow: 'animate-shimmer [animation-duration:3s]',
        normal: 'animate-shimmer [animation-duration:2s]',
        fast: 'animate-shimmer [animation-duration:1s]',
    };

    const colorGradients = {
        gold: 'from-gold-glow via-gold to-gold-glow',
        cyan: 'from-cyan-glow via-cyan to-cyan-glow',
        rainbow: 'from-gold via-cyan to-gold',
    };

    return (
        <span
            className={cn(
                'inline-block bg-gradient-to-r bg-[length:200%_100%]',
                'bg-clip-text text-transparent',
                speedClasses[speed],
                colorGradients[colors],
                className
            )}
        >
            {children}
        </span>
    );
}
