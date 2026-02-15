import { useState, useEffect, useCallback } from 'react';
import { debounce } from '@/lib/utils';

interface DraftAutoSaveProps {
    conversationId: string;
    value: string;
    onSave?: (content: string) => void;
    interval?: number; // ms
}

export function useDraftAutoSave({
    conversationId,
    value,
    onSave,
    interval = 2000
}: DraftAutoSaveProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Save draft to backend
    const saveDraft = async (content: string) => {
        if (!content.trim()) {
            // Delete draft if empty
            await fetch('/api.php?action=delete_draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ conversation_id: conversationId })
            });
            return;
        }

        setIsSaving(true);
        try {
            await fetch('/api.php?action=save_draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    conversation_id: conversationId,
                    content
                })
            });
            setLastSaved(new Date());
            onSave?.(content);
        } catch (error) {
            console.error('Draft save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Debounced save
    const debouncedSave = useCallback(
        debounce((content: string) => saveDraft(content), interval),
        [conversationId, interval]
    );

    // Auto-save on value change
    useEffect(() => {
        if (value) {
            debouncedSave(value);
        }
    }, [value, debouncedSave]);

    // Load draft on mount
    useEffect(() => {
        const loadDraft = async () => {
            try {
                const res = await fetch(
                    `/api.php?action=get_draft&conversation_id=${conversationId}`,
                    { credentials: 'include' }
                );
                const data = await res.json();
                if (data.success && data.data.content) {
                    onSave?.(data.data.content);
                }
            } catch (error) {
                console.error('Draft load failed:', error);
            }
        };
        loadDraft();
    }, [conversationId]);

    return {
        isSaving,
        lastSaved,
        saveDraft: () => saveDraft(value)
    };
}

export function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}
