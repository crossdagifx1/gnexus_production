import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NeumorphicCardProps {
    children: ReactNode;
    variant?: 'flat' | 'pressed' | 'raised';
    className?: string;
    onClick?: () => void;
}

export function NeumorphicCard({
    children,
    variant = 'flat',
    className = '',
    onClick,
}: NeumorphicCardProps) {
    const variantClasses = {
        flat: 'neomorph-flat',
        pressed: 'neomorph-inset',
        raised: 'neomorph',
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                variantClasses[variant],
                'rounded-xl p-6 transition-all duration-300',
                onClick && 'cursor-pointer hover:scale-105',
                className
            )}
        >
            {children}
        </div>
    );
}
