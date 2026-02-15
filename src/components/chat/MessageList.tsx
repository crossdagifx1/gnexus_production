/**
 * MessageList Component
 * Virtual scrolling message list for efficient rendering
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { Bot, User, Loader2 } from 'lucide-react';
import { MessageRenderer } from './MessageRenderer';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/storage/chatStorage';

interface MessageListProps {
    messages: ChatMessage[];
    loading?: boolean;
    streaming?: boolean;
    onEditMessage?: (messageId: string, newContent: string) => void;
    onDeleteMessage?: (messageId: string) => void;
    onReactMessage?: (messageId: string, emoji: string) => void;
    onPreviewCode?: (code: string, language: string) => void;
    className?: string;
}

// Estimated heights for different message types
function estimateMessageHeight(message: ChatMessage): number {
    const baseHeight = 60;
    const contentLength = message.content.length;

    // Add height based on content
    const contentHeight = Math.min(500, Math.ceil(contentLength / 50) * 20);

    // Add height for code blocks
    const codeBlocks = (message.content.match(/```[\s\S]*?```/g) || []).length;
    const codeHeight = codeBlocks * 150;

    // Add height for images
    const hasImage = message.content.startsWith('data:image/') ||
        message.content.includes('pollinations.ai');
    const imageHeight = hasImage ? 300 : 0;

    return baseHeight + contentHeight + codeHeight + imageHeight;
}

export function MessageList({
    messages,
    loading = false,
    streaming = false,
    onEditMessage,
    onDeleteMessage,
    onReactMessage,
    onPreviewCode,
    className,
}: MessageListProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const shouldAutoScroll = useRef(true);

    // Memoize message heights
    const messageHeights = useMemo(() => {
        return messages.map(msg => estimateMessageHeight(msg));
    }, [messages]);

    // Virtual list
    const virtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (index) => messageHeights[index] || 80,
        overscan: 5,
    });

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (shouldAutoScroll.current && messages.length > 0) {
            setTimeout(() => {
                virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
            }, 100);
        }
    }, [messages.length, virtualizer]);

    // Detect user scroll to stop auto-scrolling
    const handleScroll = useCallback(() => {
        if (!parentRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        shouldAutoScroll.current = isNearBottom;
    }, []);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        shouldAutoScroll.current = true;
        virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    }, [messages.length, virtualizer]);

    // Render a single message
    const renderMessage = useCallback((index: number) => {
        const message = messages[index];
        const isUser = message.role === 'user';

        return (
            <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.05, 0.3)
                }}
                className={cn(
                    'flex w-full',
                    isUser ? 'justify-end' : 'justify-start'
                )}
            >
                {/* Avatar for assistant */}
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 mr-2">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                )}

                {/* Message */}
                <div className={cn('max-w-[75%]', isUser && 'order-1')}>
                    <MessageRenderer
                        content={message.content}
                        role={message.role}
                        modelName={message.model}
                        onEdit={onEditMessage ? (content) => onEditMessage(message.id, content) : undefined}
                        onDelete={onDeleteMessage ? () => onDeleteMessage(message.id) : undefined}
                        onReact={onReactMessage ? (emoji) => onReactMessage(message.id, emoji) : undefined}
                        onPreview={onPreviewCode}
                        showActions={true}
                    />
                </div>

                {/* Avatar for user */}
                {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0 ml-2 order-2">
                        <User className="w-4 h-4 text-white" />
                    </div>
                )}
            </motion.div>
        );
    }, [messages, onEditMessage, onDeleteMessage, onReactMessage, onPreviewCode]);

    // Loading skeleton
    if (loading && messages.length === 0) {
        return (
            <div className={cn('flex flex-col items-center justify-center h-full gap-4', className)}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-gray-300 font-medium">Loading conversation...</p>
                    <p className="text-gray-500 text-sm">Retrieving your messages</p>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                </div>
            </div>
        );
    }

    // Empty state
    if (messages.length === 0) {
        return (
            <div className={cn('flex flex-col items-center justify-center h-full gap-4', className)}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-white/10">
                    <Bot className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-semibold text-white">Start a conversation</h3>
                    <p className="text-gray-500 text-sm">Send a message to begin</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('relative h-full', className)}>
            {/* Scroll to bottom button */}
            {!shouldAutoScroll.current && messages.length > 0 && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full shadow-lg transition-colors"
                >
                    <span className="text-sm font-medium">New messages</span>
                    <motion.div
                        animate={{ y: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        ↓
                    </motion.div>
                </button>
            )}

            {/* Virtual List */}
            <div
                ref={parentRef}
                onScroll={handleScroll}
                className="h-full overflow-auto px-4 py-6"
            >
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualItem) => (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                            className="py-2"
                        >
                            {renderMessage(virtualItem.index)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Streaming indicator */}
            {streaming && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full"
                >
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-sm text-gray-400">AI is thinking...</span>
                </motion.div>
            )}
        </div>
    );
}

export default MessageList;
