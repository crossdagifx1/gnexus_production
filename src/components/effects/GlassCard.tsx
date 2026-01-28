import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: ReactNode;
    variant?: 'subtle' | 'normal' | 'strong';
    className?: string;
    blurStrength?: 'sm' | 'md' | 'lg' | 'xl';
    borderGlow?: boolean;
    onClick?: () => void;
}

export function GlassCard({
    children,
    variant = 'normal',
    className = '',
    blurStrength,
    borderGlow = false,
    onClick,
}: GlassCardProps) {
    const variantClasses = {
        subtle: 'glass-subtle',
        normal: 'glass-v2',
        strong: 'glass-strong',
    };

    const blurClasses = blurStrength
        ? {
            sm: 'backdrop-blur-sm',
            md: 'backdrop-blur-md',
            lg: 'backdrop-blur-lg',
            xl: 'backdrop-blur-xl',
        }[blurStrength]
        : '';

    return (
        <div
            onClick={onClick}
            className={cn(
                variantClasses[variant],
                blurClasses,
                borderGlow && 'border-glow',
                'rounded-xl p-6 transition-all duration-300',
                onClick && 'cursor-pointer hover:shadow-depth-lg',
                className
            )}
        >
            {children}
        </div>
    );
}
