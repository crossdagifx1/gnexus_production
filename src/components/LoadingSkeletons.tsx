import { Skeleton } from '@/components/ui/skeleton';

export const StatCardSkeleton = () => (
    <div className="p-5 bg-card border border-border rounded-2xl">
        <div className="flex items-center justify-between mb-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-16 h-5 rounded" />
        </div>
        <Skeleton className="w-16 h-8 rounded mb-1" />
        <Skeleton className="w-32 h-4 rounded" />
    </div>
);

export const ChartSkeleton = () => (
    <div className="w-full h-64 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-xl" />
    </div>
);

export const TableRowSkeleton = () => (
    <div className="flex items-center gap-4 p-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-3/4 h-3 rounded" />
        </div>
        <Skeleton className="w-20 h-8 rounded" />
    </div>
);

export const ConversationCardSkeleton = () => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
        <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-20 h-4 rounded" />
                    <Skeleton className="w-16 h-5 rounded" />
                </div>
                <Skeleton className="w-3/4 h-3 rounded" />
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="w-16 h-3 rounded" />
        </div>
    </div>
);
