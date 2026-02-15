import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Heart, Laugh, PartyPopper, Brain, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface MessageReactionsProps {
    messageId: string;
    initialReactions?: Record<string, number>;
}

const REACTION_EMOJIS = [
    { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    { emoji: '❤️', icon: Heart, label: 'Love' },
    { emoji: '😂', icon: Laugh, label: 'Funny' },
    { emoji: '🎉', icon: PartyPopper, label: 'Celebrate' },
    { emoji: '🤔', icon: Brain, label: 'Thinking' },
    { emoji: '👎', icon: ThumbsDown, label: 'Dislike' }
];

export function MessageReactions({ messageId, initialReactions = {} }: MessageReactionsProps) {
    const [reactions, setReactions] = useState<Record<string, number>>(initialReactions);
    const [userReaction, setUserReaction] = useState<string | null>(null);

    const addReaction = async (emoji: string) => {
        try {
            // Optimistic update
            setReactions(prev => ({
                ...prev,
                [emoji]: (prev[emoji] || 0) + 1
            }));
            setUserReaction(emoji);

            const response = await fetch('/api.php?action=react_to_message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message_id: messageId,
                    emoji
                })
            });

            const data = await response.json();

            if (!data.success) {
                // Revert on error
                setReactions(prev => ({
                    ...prev,
                    [emoji]: Math.max((prev[emoji] || 1) - 1, 0)
                }));
                setUserReaction(null);
                throw new Error(data.error || 'Failed to add reaction');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const removeReaction = async (emoji: string) => {
        try {
            // Optimistic update
            setReactions(prev => ({
                ...prev,
                [emoji]: Math.max((prev[emoji] || 1) - 1, 0)
            }));
            setUserReaction(null);

            const response = await fetch('/api.php?action=remove_reaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message_id: messageId,
                    emoji
                })
            });

            const data = await response.json();

            if (!data.success) {
                // Revert on error
                setReactions(prev => ({
                    ...prev,
                    [emoji]: (prev[emoji] || 0) + 1
                }));
                setUserReaction(emoji);
                throw new Error(data.error || 'Failed to remove reaction');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const toggleReaction = (emoji: string) => {
        if (userReaction === emoji) {
            removeReaction(emoji);
        } else {
            if (userReaction) {
                removeReaction(userReaction);
            }
            addReaction(emoji);
        }
    };

    const reactionEntries = Object.entries(reactions).filter(([_, count]) => count > 0);

    return (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
            {/* Existing reactions */}
            {reactionEntries.map(([emoji, count]) => (
                <motion.div
                    key={emoji}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant={userReaction === emoji ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleReaction(emoji)}
                        className="h-7 px-2 text-xs gap-1"
                    >
                        <span>{emoji}</span>
                        <span className="font-mono">{count}</span>
                    </Button>
                </motion.div>
            ))}

            {/* Add reaction */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-auto">
                    <div className="grid grid-cols-3 gap-1 p-1">
                        {REACTION_EMOJIS.map(({ emoji, label }) => (
                            <DropdownMenuItem
                                key={emoji}
                                onClick={() => toggleReaction(emoji)}
                                className="justify-center text-2xl p-2 cursor-pointer"
                                title={label}
                            >
                                {emoji}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
