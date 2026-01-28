import { ReactNode } from 'react';

interface ScrollRevealTextProps {
    children: ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
    fillColor?: string;
    scrub?: boolean | number;
}

// ScrollRevealText disabled - no scroll reveal animations
export const ScrollRevealText = ({
    children,
    className = '',
    as: Component = 'p',
}: ScrollRevealTextProps) => {
    return (
        <Component className={`relative inline-block ${className}`}>
            {children}
        </Component>
    );
};

// CharReveal disabled - no character reveal animations
interface CharRevealProps {
    children: string;
    className?: string;
    stagger?: number;
}

export const CharReveal = ({
    children,
    className = '',
}: CharRevealProps) => {
    return (
        <div className={className}>
            {children}
        </div>
    );
};
