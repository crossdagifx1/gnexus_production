import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, History, X, Check, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface MessageActionsProps {
    messageId: string;
    content: string;
    role: 'user' | 'assistant';
    editCount: number;
    editedAt?: string;
    deletedAt?: string;
    onEdit?: (newContent: string) => Promise<void>;
    onDelete?: () => Promise<void>;
    onRestore?: () => Promise<void>;
}

export function MessageActions({
    messageId,
    content,
    role,
    editCount,
    editedAt,
    deletedAt,
    onEdit,
    onDelete,
    onRestore
}: MessageActionsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<Array<{
        old_content: string;
        edited_at: string;
        edited_by: string;
    }>>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleEdit = async () => {
        if (editedContent.trim() === content.trim()) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            await onEdit?.(editedContent);
            toast.success('Message updated');
            setIsEditing(false);
        } catch (error: any) {
            toast.error('Failed to update: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this message? You can undo within 30 seconds.')) {
            return;
        }

        setIsLoading(true);
        try {
            await onDelete?.();
            toast.success('Message deleted', {
                action: {
                    label: 'Undo',
                    onClick: handleRestore
                },
                duration: 30000
            });
        } catch (error: any) {
            toast.error('Failed to delete: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async () => {
        setIsLoading(true);
        try {
            await onRestore?.();
            toast.success('Message restored');
        } catch (error: any) {
            toast.error('Failed to restore: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const res = await fetch(`/api.php?action=get_message_history&message_id=${messageId}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
                setShowHistory(true);
            }
        } catch (error: any) {
            toast.error('Failed to load history');
        }
    };

    // Only show actions for user messages
    if (role !== 'user') return null;

    // If deleted, show restore option
    if (deletedAt) {
        return (
            <div className="flex items-center gap-2 mt-2 opacity-50">
                <span className="text-xs text-muted-foreground italic">Message deleted</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRestore}
                    disabled={isLoading}
                    className="h-6 px-2"
                >
                    <Undo className="w-3 h-3 mr-1" />
                    Restore
                </Button>
            </div>
        );
    }

    return (
        <>
            <AnimatePresence>
                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-2"
                    >
                        <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="min-h-[60px]"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleEdit}
                                disabled={isLoading || !editedContent.trim()}
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setEditedContent(content);
                                    setIsEditing(false);
                                }}
                                disabled={isLoading}
                            >
                                <X className="w-3 h-3 mr-1" />
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="h-6 px-2"
                        >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                        </Button>

                        {editCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadHistory}
                                className="h-6 px-2"
                            >
                                <History className="w-3 h-3 mr-1" />
                                {editCount} {editCount === 1 ? 'edit' : 'edits'}
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="h-6 px-2 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit metadata */}
            {editedAt && !isEditing && (
                <div className="text-xs text-muted-foreground mt-1">
                    Edited {new Date(editedAt).toLocaleString()}
                </div>
            )}

            {/* History Dialog */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit History</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {/* Current version */}
                        <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">Current Version</span>
                                <span className="text-xs text-muted-foreground">
                                    {editedAt ? new Date(editedAt).toLocaleString() : 'Original'}
                                </span>
                            </div>
                            <p className="text-sm">{content}</p>
                        </div>

                        {/* Previous versions */}
                        {history.map((item, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium">
                                        Version {history.length - index}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(item.edited_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.old_content}</p>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
