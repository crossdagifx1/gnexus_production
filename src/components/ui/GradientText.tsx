import React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
    children: React.ReactNode;
    from?: 'gold' | 'cyan' | 'success' | 'error';
    to?: 'gold' | 'cyan' | 'success' | 'error' | 'purple';
    animated?: boolean;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

/**
 * GradientText Component
 * 
 * Renders text with gradient color that can optionally animate.
 * 
 * @param from - Starting gradient color
 * @param to - Ending gradient color
 * @param animated - Enables gradient animation
 * @param as - HTML element to render
 * 
 * @example
 * <GradientText from="gold" to="cyan" animated>
 *   Premium Features
 * </GradientText>
 */
export const GradientText: React.FC<GradientTextProps> = ({
    children,
    from = 'gold',
    to = 'cyan',
    animated = false,
    className,
    as: Component = 'span',
}) => {
    const gradientColors = {
        gold: 'var(--gold)',
        cyan: 'var(--cyan)',
        success: 'var(--success)',
        error: 'var(--error)',
        purple: '#8B5CF6',
    };

    const gradientStyle = {
        background: `linear-gradient(135deg, ${gradientColors[from]} 0%, ${gradientColors[to]} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        backgroundSize: animated ? '200% auto' : 'auto',
    };

    return (
        <Component
            className={cn(
                'font-bold inline-block',
                animated && 'animate-gradient bg-gradient-to-r',
                className
            )}
            style={gradientStyle}
        >
            {children}
        </Component>
    );
};

// Add gradient animation to design-tokens.css if not already there
export default GradientText;
