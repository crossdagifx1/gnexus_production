import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagProps {
    children: React.ReactNode;
    variant?: 'default' | 'gold' | 'cyan' | 'success' | 'error' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    closable?: boolean;
    onClose?: () => void;
    className?: string;
}

/**
 * Tag Component (also called Chip)
 * 
 * Display tags, labels, or chips with optional close button.
 * Perfect for filters, categories, and selected items.
 * 
 * @param variant - Color variant of the tag
 * @param size - Size of the tag
 * @param closable - Shows close button
 * @param onClose - Handler for close button click
 * 
 * @example
 * <Tag variant="gold" closable onClose={() => console.log('closed')}>
 *   Premium
 * </Tag>
 */
export const Tag: React.FC<TagProps> = ({
    children,
    variant = 'default',
    size = 'md',
    closable = false,
    onClose,
    className,
}) => {
    const variantStyles = {
        default: 'bg-surface-elevated text-text-primary border-border-color',
        gold: 'bg-gold/20 text-gold border-gold/30',
        cyan: 'bg-cyan/20 text-cyan border-cyan/30',
        success: 'bg-success/20 text-success border-success/30',
        error: 'bg-error/20 text-error border-error/30',
        outline: 'bg-transparent text-text-primary border-border-color',
    };

    const sizeStyles = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-sm px-3 py-1 gap-1.5',
        lg: 'text-base px-4 py-1.5 gap-2',
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16,
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border font-medium',
                'transition-all duration-200',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {children}
            {closable && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose?.();
                    }}
                    className={cn(
                        'ml-1 rounded-full hover:bg-white/10 transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-offset-1',
                        variant === 'gold' && 'focus:ring-gold',
                        variant === 'cyan' && 'focus:ring-cyan'
                    )}
                    aria-label="Remove tag"
                >
                    <X size={iconSizes[size]} />
                </button>
            )}
        </span>
    );
};

/**
 * TagGroup Component
 * 
 * Container for multiple tags with consistent spacing.
 * 
 * @example
 * <TagGroup>
 *   <Tag variant="gold">React</Tag>
 *   <Tag variant="cyan">TypeScript</Tag>
 * </TagGroup>
 */
interface TagGroupProps {
    children: React.ReactNode;
    spacing?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const TagGroup: React.FC<TagGroupProps> = ({
    children,
    spacing = 'md',
    className,
}) => {
    const spacingStyles = {
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
    };

    return (
        <div className={cn('flex flex-wrap items-center', spacingStyles[spacing], className)}>
            {children}
        </div>
    );
};

export default Tag;
