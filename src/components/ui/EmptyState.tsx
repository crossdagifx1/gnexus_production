import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

/**
 * EmptyState Component
 * 
 * Displays a friendly empty state with optional icon, description, and action button.
 * Use when lists, tables, or data views have no items to display.
 * 
 * @param icon - Optional icon element (e.g., from lucide-react)
 * @param title - Main heading text
 * @param description - Optional descriptive text
 * @param action - Optional action button or link
 * 
 * @example
 * <EmptyState
 *   icon={<InboxIcon className="w-16 h-16" />}
 *   title="No messages yet"
 *   description="Start a conversation to see messages here"
 *   action={<Button>Start Conversation</Button>}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-16 px-6 text-center',
                className
            )}
        >
            {icon && (
                <div className="mb-4 text-text-tertiary opacity-60 animate-fadeIn">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-text-primary mb-2 animate-slideUp">
                {title}
            </h3>
            {description && (
                <p className="text-text-secondary max-w-md mb-6 animate-slideUp" style={{ animationDelay: '100ms' }}>
                    {description}
                </p>
            )}
            {action && (
                <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
