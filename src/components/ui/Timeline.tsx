import React from 'react';
import { cn } from '@/lib/utils';

interface TimelineItem {
    id: string | number;
    title: string;
    description?: string;
    timestamp?: string;
    status?: 'completed' | 'current' | 'pending';
    icon?: React.ReactNode;
}

interface TimelineProps {
    items: TimelineItem[];
    variant?: 'vertical' | 'horizontal';
    animated?: boolean;
    className?: string;
}

/**
 * Timeline Component
 * 
 * Displays a chronological sequence of events or milestones.
 * 
 * @param items -  Array of timeline items with status and content
 * @param variant - Layout orientation ('vertical' | 'horizontal')
 * @param animated - Enables entrance animations
 * 
 * @example
 * <Timeline
 *   items={[
 *     { id: 1, title: "Project Started", status: "completed", timestamp: "Jan 15" },
 *     { id: 2, title: "Design Phase", status: "current" },
 *     { id: 3, title: "Development", status: "pending" }
 *   ]}
 *   variant="vertical"
 * />
 */
export const Timeline: React.FC<TimelineProps> = ({
    items,
    variant = 'vertical',
    animated = true,
    className,
}) => {
    const statusColors = {
        completed: 'bg-success border-success text-success',
        current: 'bg-cyan border-cyan text-cyan',
        pending: 'bg-surface-elevated border-border-color text-text-tertiary',
    };

    if (variant === 'horizontal') {
        return (
            <div className={cn('flex items-start gap-4 overflow-x-auto', className)}>
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={cn(
                            'flex-shrink-0 flex flex-col items-center min-w-[120px]',
                            animated && 'animate-fadeIn'
                        )}
                        style={animated ? { animationDelay: `${index * 100}ms` } : {}}
                    >
                        {/* Step indicator */}
                        <div className="relative flex items-center">
                            {/* Connector line (left) */}
                            {index > 0 && (
                                <div
                                    className={cn(
                                        'absolute right-full w-16 h-0.5',
                                        item.status === 'completed' ? 'bg-success' : 'bg-border-color'
                                    )}
                                />
                            )}

                            {/* Circle */}
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10',
                                    statusColors[item.status || 'pending']
                                )}
                            >
                                {item.icon || (
                                    <span className="text-sm font-semibold">{index + 1}</span>
                                )}
                            </div>

                            {/* Connector line (right) */}
                            {index < items.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute left-full w-16 h-0.5',
                                        item.status === 'completed' ? 'bg-success' : 'bg-border-color'
                                    )}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="text-center mt-4">
                            <p className="font-medium text-sm text-text-primary mb-1">{item.title}</p>
                            {item.timestamp && (
                                <p className="text-xs text-text-tertiary">{item.timestamp}</p>
                            )}
                            {item.description && (
                                <p className="text-xs text-text-secondary mt-2 max-w-[140px]">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Vertical variant
    return (
        <div className={cn('space-y-4', className)}>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={cn(
                        'flex gap-4',
                        animated && 'animate-slideUp'
                    )}
                    style={animated ? { animationDelay: `${index * 100}ms` } : {}}
                >
                    {/* Timeline track */}
                    <div className="flex flex-col items-center">
                        {/* Circle */}
                        <div
                            className={cn(
                                'w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                                statusColors[item.status || 'pending']
                            )}
                        >
                            {item.icon || (
                                <span className="text-sm font-semibold">{index + 1}</span>
                            )}
                        </div>

                        {/* Vertical line */}
                        {index < items.length - 1 && (
                            <div
                                className={cn(
                                    'w-0.5 flex-1 mt-2',
                                    item.status === 'completed' ? 'bg-success' : 'bg-border-color'
                                )}
                                style={{ minHeight: '40px' }}
                            />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-text-primary">{item.title}</h4>
                            {item.timestamp && (
                                <span className="text-sm text-text-tertiary">{item.timestamp}</span>
                            )}
                        </div>
                        {item.description && (
                            <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Timeline;
