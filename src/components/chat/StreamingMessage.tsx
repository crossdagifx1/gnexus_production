import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { StopCircle, Copy, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

interface StreamingMessageProps {
    conversationId: string;
    userMessage: string;
    messageId: string;
    onComplete: (content: string, tokens: number) => void;
    onError: (error: string) => void;
}

export function StreamingMessage({
    conversationId,
    userMessage,
    messageId,
    onComplete,
    onError
}: StreamingMessageProps) {
    const [content, setContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(true);
    const [tokens, setTokens] = useState(0);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        const url = new URL('/stream_ai_response.php', window.location.origin);
        url.searchParams.set('conversation_id', conversationId);
        url.searchParams.set('message', userMessage);
        url.searchParams.set('message_id', messageId);

        const eventSource = new EventSource(url.toString(), {
            withCredentials: true
        });

        eventSourceRef.current = eventSource;

        eventSource.addEventListener('delta', (event) => {
            const data = JSON.parse(event.data);
            setContent(prev => prev + data.content);
            setTokens(prev => prev + 1);
        });

        eventSource.addEventListener('complete', (event) => {
            const data = JSON.parse(event.data);
            setContent(data.content);
            setTokens(data.tokens || tokens);
            setIsStreaming(false);
            eventSource.close();
            onComplete(data.content, data.tokens || tokens);
        });

        eventSource.addEventListener('done', (event) => {
            const data = JSON.parse(event.data);
            setIsStreaming(false);
            eventSource.close();
            onComplete(data.content, data.tokens);
        });

        eventSource.addEventListener('error', (event) => {
            const data = JSON.parse((event as MessageEvent).data);
            setIsStreaming(false);
            eventSource.close();
            onError(data.message || 'Streaming error');
        });

        eventSource.onerror = () => {
            setIsStreaming(false);
            eventSource.close();
            onError('Connection error');
        };

        return () => {
            eventSource.close();
        };
    }, [conversationId, userMessage, messageId]);

    const stopGeneration = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            setIsStreaming(false);
            toast.info('Generation stopped');
        }
    };

    const copyContent = () => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
        >
            <Card className="max-w-[80%] bg-muted relative">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 prose dark:prose-invert max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const language = match ? match[1] : '';

                                        if (!inline && language) {
                                            return (
                                                <div className="relative group my-4">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(String(children));
                                                            toast.success('Code copied');
                                                        }}
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background p-1 rounded"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <SyntaxHighlighter
                                                        language={language}
                                                        style={vscDarkPlus}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        }

                                        return (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline hover:text-primary/80"
                                        >
                                            {children}
                                        </a>
                                    )
                                }}
                            >
                                {content}
                            </ReactMarkdown>

                            {isStreaming && (
                                <motion.span
                                    className="inline-block w-2 h-4 bg-primary ml-1"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            {isStreaming ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={stopGeneration}
                                >
                                    <StopCircle className="w-3 h-3 text-red-500" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={copyContent}
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {isStreaming && (
                            <span className="flex items-center gap-1">
                                <motion.div
                                    className="w-1.5 h-1.5 bg-green-500 rounded-full"
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                                Streaming...
                            </span>
                        )}
                        <span>{tokens} tokens</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
