import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    variant?: 'default' | 'gold' | 'cyan' | 'success' | 'error';
    animated?: boolean;
    className?: string;
}

/**
 * StatCard Component
 * 
 * Displays a statistic with optional trend indicator and icon.
 * Perfect for dashboards and analytics views.
 * 
 * @param label - The label for the statistic
 * @param value - The numerical or string value to display
 * @param change - Optional percentage change value
 * @param trend - Direction of trend ('up' | 'down' | 'neutral')
 * @param icon - Optional icon element
 * @param variant - Color variant of the card
 * @param animated - Enables count-up animation
 * 
 * @example
 * <StatCard
 *   label="Total Revenue"
 *   value="$45,230"
 *   change={12.5}
 *   trend="up"
 *   icon={<DollarSign />}
 *   variant="gold"
 * />
 */
export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    trend = 'neutral',
    icon,
    variant = 'default',
    animated = false,
    className,
}) => {
    const variantStyles = {
        default: 'bg-surface border-border-color',
        gold: 'bg-gradient-to-br from-gold/20 to-gold/5 border-gold/30',
        cyan: 'bg-gradient-to-br from-cyan/20 to-cyan/5 border-cyan/30',
        success: 'bg-gradient-to-br from-success/20 to-success/5 border-success/30',
        error: 'bg-gradient-to-br from-error/20 to-error/5 border-error/30',
    };

    const trendColors = {
        up: 'text-success',
        down: 'text-error',
        neutral: 'text-text-secondary',
    };

    const trendIcon = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <div
            className={cn(
                'rounded-xl border p-6 transition-all duration-300',
                'hover:shadow-lg hover:-translate-y-1',
                variantStyles[variant],
                animated && 'animate-slideUp',
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-text-secondary mb-1">{label}</p>
                    <p className="text-3xl font-bold text-text-primary tracking-tight">
                        {value}
                    </p>
                    {change !== undefined && (
                        <div className={cn('flex items-center gap-1 mt-2 text-sm font-medium', trendColors[trend])}>
                            <span>{trendIcon[trend]}</span>
                            <span>{Math.abs(change)}%</span>
                            <span className="text-text-tertiary text-xs">vs last period</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        variant === 'gold' && 'bg-gold/20 text-gold',
                        variant === 'cyan' && 'bg-cyan/20 text-cyan',
                        variant === 'success' && 'bg-success/20 text-success',
                        variant === 'error' && 'bg-error/20 text-error',
                        variant === 'default' && 'bg-surface-elevated text-text-primary'
                    )}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
