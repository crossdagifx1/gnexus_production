import { getTimeAgo } from '@/hooks/useDraftAutoSave';

interface DraftIndicatorProps {
    isSaving: boolean;
    lastSaved: Date | null;
}

export function DraftIndicator({ isSaving, lastSaved }: DraftIndicatorProps) {
    if (isSaving) {
        return (
            <span className="text-xs text-muted-foreground">
                Saving draft...
            </span>
        );
    }

    if (lastSaved) {
        const timeAgo = getTimeAgo(lastSaved);
        return (
            <span className="text-xs text-muted-foreground">
                Draft saved {timeAgo}
            </span>
        );
    }

    return null;
}
