import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExecutableCodeBlock } from './ExecutableCodeBlock';
import { MessageReactions } from './MessageReactions';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    tokens_input?: number;
    tokens_output?: number;
    cost?: number;
}

interface VirtualizedMessageListProps {
    messages: Message[];
    scrollToBottom?: boolean;
}

export function VirtualizedMessageList({ messages, scrollToBottom = false }: VirtualizedMessageListProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 200, // Estimated message height
        overscan: 5 // Render 5 extra items above/below viewport
    });

    useEffect(() => {
        if (scrollToBottom && messages.length > 0) {
            virtualizer.scrollToIndex(messages.length - 1, {
                align: 'end',
                behavior: 'smooth'
            });
        }
    }, [messages.length, scrollToBottom]);

    return (
        <div ref={parentRef} className="flex-1 overflow-auto p-4">
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                }}
            >
                <div className="max-w-4xl mx-auto">
                    {virtualizer.getVirtualItems().map((virtualItem) => {
                        const message = messages[virtualItem.index];

                        return (
                            <div
                                key={virtualItem.key}
                                data-index={virtualItem.index}
                                ref={virtualizer.measureElement}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${virtualItem.start}px)`
                                }}
                                className="mb-4 group"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <Card
                                        className={`max-w-[80%] ${message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                            }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="prose dark:prose-invert max-w-none">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const language = match ? match[1] : '';
                                                            const isInline = !language;

                                                            if (!isInline && language) {
                                                                return (
                                                                    <ExecutableCodeBlock
                                                                        code={String(children).replace(/\n$/, '')}
                                                                        language={language}
                                                                        messageId={message.id}
                                                                    />
                                                                );
                                                            }

                                                            return (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                                                <span>
                                                    {new Date(message.created_at).toLocaleTimeString()}
                                                </span>
                                                {message.tokens_input && (
                                                    <span>
                                                        •{' '}
                                                        {message.tokens_input + (message.tokens_output || 0)}{' '}
                                                        tokens
                                                    </span>
                                                )}
                                                {message.cost && (
                                                    <span>• ${message.cost.toFixed(4)}</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {message.role === 'assistant' && (
                                    <MessageReactions messageId={message.id} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
