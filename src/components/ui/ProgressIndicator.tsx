import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
    value: number;
    max?: number;
    variant?: 'circular' | 'linear';
    size?: 'sm' | 'md' | 'lg';
    color?: 'gold' | 'cyan' | 'success' | 'error' | 'default';
    showLabel?: boolean;
    animated?: boolean;
    className?: string;
}

/**
 * ProgressIndicator Component
 * 
 * Displays progress as either a circular dial or linear bar.
 * 
 * @param value - Current progress value
 * @param max - Maximum value (default: 100)
 * @param variant - Display style ('circular' | 'linear')
 * @param size - Size of the indicator
 * @param color - Color variant
 * @param showLabel - Whether to display percentage label
 * @param animated - Enables smooth animation
 * 
 * @example
 * <ProgressIndicator value={75} variant="circular" showLabel />
 * <ProgressIndicator value={60} variant="linear" color="gold" />
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    value,
    max = 100,
    variant = 'linear',
    size = 'md',
    color = 'default',
    showLabel = false,
    animated = true,
    className,
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colorStyles = {
        gold: 'from-gold to-gold-dark',
        cyan: 'from-cyan to-cyan-dark',
        success: 'from-success to-success-dark',
        error: 'from-error to-error-dark',
        default: 'from-text-secondary to-text-primary',
    };

    if (variant === 'circular') {
        const sizeStyles = {
            sm: { width: 40, stroke: 3 },
            md: { width: 60, stroke: 4 },
            lg: { width: 80, stroke: 5 },
        };

        const { width, stroke } = sizeStyles[size];
        const radius = (width - stroke * 2) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className={cn('relative inline-flex items-center justify-center', className)}>
                <svg width={width} height={width} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={stroke}
                        fill="none"
                        className="text-surface-elevated"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={width / 2}
                        cy={width / 2}
                        r={radius}
                        stroke="url(#gradient)"
                        strokeWidth={stroke}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={animated ? 'transition-all duration-500 ease-out' : ''}
                    />
                    {/* Gradient definition */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className={`text-${color}`} style={{ stopColor: 'currentColor' }} />
                            <stop offset="100%" className={`text-${color}-dark`} style={{ stopColor: 'currentColor' }} />
                        </linearGradient>
                    </defs>
                </svg>
                {showLabel && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-text-primary">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // Linear variant
    const heightStyles = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    return (
        <div className={cn('w-full', className)}>
            {showLabel && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-text-secondary">Progress</span>
                    <span className="text-sm font-semibold text-text-primary">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div className={cn('relative w-full rounded-full overflow-hidden bg-surface-elevated', heightStyles[size])}>
                <div
                    className={cn(
                        'h-full rounded-full bg-gradient-to-r',
                        colorStyles[color],
                        animated && 'transition-all duration-500 ease-out'
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressIndicator;
