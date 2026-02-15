import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    variant?: 'subtle' | 'default' | 'prominent';
    blur?: 'sm' | 'md' | 'lg';
    className?: string;
    hover?: boolean;
    animated?: boolean;
    onClick?: () => void;
}

/**
 * GlassCard Component
 * 
 * A glassmorphism card component with customizable blur and background intensity.
 * 
 * @param variant - Controls the opacity and border visibility ('subtle' | 'default' | 'prominent')
 * @param blur - Controls the backdrop blur amount ('sm' | 'md' | 'lg')
 * @param hover - Enables hover lift effect
 * @param animated - Adds entrance animation
 * 
 * @example
 * <GlassCard variant="prominent" blur="lg" hover>
 *   <h2>Card Title</h2>
 *   <p>Card content...</p>
 * </GlassCard>
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    variant = 'default',
    blur = 'md',
    className,
    hover = false,
    animated = false,
    onClick,
}) => {
    const variantStyles = {
        subtle: 'bg-glass-bg/40 border-glass-border/50',
        default: 'bg-glass-bg border-glass-border',
        prominent: 'bg-glass-bg/80 border-glass-border/80',
    };

    const blurStyles = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
    };

    return (
        <div
            className={cn(
                'rounded-2xl border overflow-hidden transition-all duration-300',
                variantStyles[variant],
                blurStyles[blur],
                hover && 'hover-lift cursor-pointer',
                animated && 'animate-slideUp',
                className
            )}
            onClick={onClick}
            style={{
                WebkitBackdropFilter: blur === 'lg' ? 'blur(12px)' : blur === 'md' ? 'blur(8px)' : 'blur(4px)',
            }}
        >
            {children}
        </div>
    );
};

interface GlassCardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const GlassCardHeader: React.FC<GlassCardHeaderProps> = ({
    children,
    className,
}) => {
    return (
        <div className={cn('p-6 border-b border-border-color/50', className)}>
            {children}
        </div>
    );
};

interface GlassCardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const GlassCardContent: React.FC<GlassCardContentProps> = ({
    children,
    className,
}) => {
    return <div className={cn('p-6', className)}>{children}</div>;
};

interface GlassCardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const GlassCardFooter: React.FC<GlassCardFooterProps> = ({
    children,
    className,
}) => {
    return (
        <div className={cn('p-6 border-t border-border-color/50', className)}>
            {children}
        </div>
    );
};

// Export all components
export default GlassCard;
