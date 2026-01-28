import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    fullScreen = false,
    message = 'Loading...',
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
            {message && (
                <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

// Page-level loading component
export const PageLoader: React.FC<{ message?: string }> = ({ message }) => {
    return <LoadingSpinner size="lg" fullScreen message={message} />;
};

// Section-level loading component
export const SectionLoader: React.FC = () => {
    return (
        <div className="w-full py-12">
            <LoadingSpinner size="md" message="Loading section..." />
        </div>
    );
};

// Skeleton loading components for better UX
export const SkeletonCard: React.FC = () => {
    return (
        <div className="glass rounded-lg p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
        </div>
    );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
    return (
        <div className="space-y-2 animate-pulse">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`h-3 bg-muted rounded ${i === lines - 1 ? 'w-4/5' : 'w-full'}`}
                ></div>
            ))}
        </div>
    );
};
