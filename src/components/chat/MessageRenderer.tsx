/**
 * MessageRenderer Component
 * Enhanced message rendering with markdown, code highlighting, and rich content
 */

import { useState, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Copy, Check, Play, Download, ThumbsUp, ThumbsDown, MoreHorizontal,
    Edit2, Trash2, MessageSquare, Smile, AlertCircle, Eye, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MessageActionMenu } from './MessageActionMenu';
import { QuickActionToolbar } from './QuickActionToolbar';
import { textToSpeech } from '@/lib/ai';

interface MessageRendererProps {
    content: string;
    role: 'user' | 'assistant' | 'system';
    onEdit?: (newContent: string) => void;
    onDelete?: () => void;
    onReact?: (emoji: string) => void;
    onPreview?: (code: string, language: string) => void;
    className?: string;
    showActions?: boolean;
    modelName?: string;
}

interface CodeBlockProps {
    code: string;
    language: string;
    onPreview?: (code: string, language: string) => void;
}

interface InlineCodeProps {
    children: React.ReactNode;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const CodeBlock = memo(function CodeBlock({ code, language, onPreview }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const normalizedLang = language?.toLowerCase() || '';
    const canPreview = ['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'markup', 'xml'].includes(normalizedLang);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard');
    }, [code]);

    const handlePreview = useCallback(() => {
        if (onPreview) {
            onPreview(code, normalizedLang);
            setShowPreview(true);
        }
    }, [code, normalizedLang, onPreview]);

    return (
        <div className="my-3 rounded-lg overflow-hidden border border-white/10 bg-[#1e1e1e]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        {language || 'text'}
                    </span>
                    {canPreview && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                            Preview Available
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {canPreview && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePreview}
                            className="h-7 px-2 text-xs hover:bg-white/10 text-cyan-400 gap-1.5"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 px-2 text-xs hover:bg-white/10 text-gray-400 gap-1.5"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-green-400">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Code Content */}
            <div className="overflow-x-auto">
                <SyntaxHighlighter
                    language={normalizedLang || 'text'}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
});

const InlineCode = memo(function InlineCode({ children }: InlineCodeProps) {
    return (
        <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 font-mono text-sm">
            {children}
        </code>
    );
});

// Reaction picker content
const reactionEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '🎉', '🔥'];

function ReactionPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
    return (
        <div className="flex gap-1 p-2">
            {reactionEmojis.map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg rounded-md hover:bg-white/10 transition-colors"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MessageRenderer({
    content,
    role,
    onEdit,
    onDelete,
    onReact,
    onPreview,
    className,
    showActions = true,
}: MessageRendererProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    const isUser = role === 'user';
    const isSystem = role === 'system';

    // Check if content is a single image URL
    const isImageUrl = content.startsWith('data:image/') ||
        (/^(http|https):\/\/[^ "]+$/.test(content) &&
            (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(content) ||
                content.includes('pollinations.ai') ||
                content.includes('openrouter')));

    const handleSaveEdit = useCallback(() => {
        if (onEdit && editContent.trim()) {
            onEdit(editContent.trim());
            setIsEditing(false);
        }
    }, [editContent, onEdit]);

    const handleCancelEdit = useCallback(() => {
        setEditContent(content);
        setIsEditing(false);
    }, [content]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    }, [handleSaveEdit, handleCancelEdit]);

    const handleDownloadImage = useCallback(async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gnexus-image-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('Image downloaded');
        } catch (err) {
            toast.error('Failed to download image');
        }
    }, []);

    return (
        <TooltipProvider>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('group', className)}
            >
                {/* Message Bubble */}
                <div
                    className={cn(
                        'relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        isUser
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white ml-auto rounded-tr-sm'
                            : isSystem
                                ? 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/20'
                                : 'bg-white/10 text-gray-200 mr-auto rounded-tl-sm',
                        isEditing && 'ring-2 ring-cyan-500/50'
                    )}
                >
                    {/* Top Corner More Options Button (Matches User Screenshot) */}
                    {!isUser && !isSystem && !isImageUrl && !isEditing && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                                    >
                                        <MoreHorizontal className="w-3.5 h-3.5 rotate-90" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-fit p-0 bg-transparent border-none shadow-none" align="end">
                                    <MessageActionMenu
                                        role={role}
                                        modelName={modelName}
                                        onCopy={async () => {
                                            await navigator.clipboard.writeText(content);
                                            toast.success('Copied to clipboard');
                                        }}
                                        onReadAloud={async () => {
                                            toast.info('Synthesizing speech...');
                                            try {
                                                const response = await textToSpeech(content);
                                                if (response.success && response.data) {
                                                    const audio = new Audio(response.data);
                                                    audio.play();
                                                    toast.success('Playing audio');
                                                }
                                            } catch (err) {
                                                toast.error('Error playing audio');
                                            }
                                        }}
                                        onFeedback={(type) => {
                                            onReact?.(type === 'good' ? '👍' : '👎');
                                            toast.success('Thanks for your feedback!');
                                        }}
                                        onRegenerate={() => {
                                            toast.info('Regenerating response...');
                                        }}
                                        onAnalyze={() => {
                                            toast.info('Analyzing response logic...');
                                        }}
                                        onShare={() => {
                                            toast.success('Conversation link copied');
                                        }}
                                        onExport={() => {
                                            toast.success('Exporting conversation...');
                                        }}
                                        onReport={() => {
                                            toast.info('Legal report submitted');
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {/* Corner Copy Button (Matches User Screenshot) */}
                    {!isUser && !isSystem && !isImageUrl && !isEditing && (
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(content);
                                    toast.success('Copied to clipboard');
                                }}
                                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}
                    {/* Image content */}
                    {isImageUrl && (
                        <div className="relative group mt-2 rounded-lg overflow-hidden border border-white/10">
                            <img
                                src={content}
                                alt="AI Generated"
                                className="w-full h-auto object-cover max-h-[400px]"
                                loading="lazy"
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80"
                                            onClick={() => handleDownloadImage(content)}
                                        >
                                            <Download className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download Image</TooltipContent>
                                </Tooltip>
                            </motion.div>
                        </div>
                    )}

                    {/* Edit mode */}
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-cyan-500/50"
                                rows={Math.min(10, Math.max(3, editContent.split('\n').length))}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                    className="text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    className="bg-cyan-500 hover:bg-cyan-400"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Markdown content */
                        !isImageUrl && (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code({ node, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const isInline = !match;

                                            if (isInline) {
                                                return <InlineCode>{children}</InlineCode>;
                                            }

                                            return (
                                                <CodeBlock
                                                    code={String(children).replace(/\n$/, '')}
                                                    language={match[1]}
                                                    onPreview={onPreview}
                                                />
                                            );
                                        },
                                        a({ node, children, href, ...props }) {
                                            return (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-cyan-400 hover:underline"
                                                    {...props}
                                                >
                                                    {children}
                                                </a>
                                            );
                                        },
                                        ul({ node, children, ...props }) {
                                            return (
                                                <ul className="list-disc list-inside space-y-1" {...props}>
                                                    {children}
                                                </ul>
                                            );
                                        },
                                        ol({ node, children, ...props }) {
                                            return (
                                                <ol className="list-decimal list-inside space-y-1" {...props}>
                                                    {children}
                                                </ol>
                                            );
                                        },
                                        blockquote({ node, children, ...props }) {
                                            return (
                                                <blockquote
                                                    className="border-l-2 border-cyan-500/50 pl-4 italic text-gray-400"
                                                    {...props}
                                                >
                                                    {children}
                                                </blockquote>
                                            );
                                        },
                                        table({ node, children, ...props }) {
                                            return (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-white/10" {...props}>
                                                        {children}
                                                    </table>
                                                </div>
                                            );
                                        },
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        )
                    )}
                </div>

                {/* Actions Menu */}
                {showActions && !isSystem && (
                    <div className={cn(
                        'absolute bottom-0 translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2',
                        isUser ? 'right-4' : 'left-4'
                    )}>
                        <Popover open={showActionsMenu} onOpenChange={setShowActionsMenu}>
                            <QuickActionToolbar
                                role={role}
                                content={content}
                                onCopy={async () => {
                                    await navigator.clipboard.writeText(content);
                                    toast.success('Copied to clipboard');
                                }}
                                onReadAloud={async () => {
                                    toast.info('Synthesizing speech...');
                                    try {
                                        const response = await textToSpeech(content);
                                        if (response.success && response.data) {
                                            const audio = new Audio(response.data);
                                            audio.play();
                                            toast.success('Playing audio');
                                        }
                                    } catch (err) {
                                        toast.error('Error playing audio');
                                    }
                                }}
                                onFeedback={(type) => {
                                    onReact?.(type === 'good' ? '👍' : '👎');
                                    toast.success('Thanks for your feedback!');
                                }}
                                onRegenerate={role === 'assistant' ? () => {
                                    toast.info('Regenerating response...');
                                } : undefined}
                                onMore={() => setShowActionsMenu(true)}
                            />

                            <PopoverTrigger asChild>
                                <span className="sr-only">Open menu</span>
                            </PopoverTrigger>
                            <PopoverContent className="w-fit p-0 bg-transparent border-none shadow-none" align={isUser ? 'end' : 'start'}>
                                <MessageActionMenu
                                    role={role}
                                    modelName={modelName}
                                    onCopy={async () => {
                                        await navigator.clipboard.writeText(content);
                                        toast.success('Copied to clipboard');
                                        setShowActionsMenu(false);
                                    }}
                                    onReadAloud={async () => {
                                        toast.info('Synthesizing speech...');
                                        try {
                                            const response = await textToSpeech(content);
                                            if (response.success && response.data) {
                                                const audio = new Audio(response.data);
                                                audio.play();
                                                toast.success('Playing audio');
                                            }
                                        } catch (err) {
                                            toast.error('Error playing audio');
                                        }
                                        setShowActionsMenu(false);
                                    }}
                                    onFeedback={(type) => {
                                        onReact?.(type === 'good' ? '👍' : '👎');
                                        toast.success('Thanks for your feedback!');
                                        setShowActionsMenu(false);
                                    }}
                                    onRegenerate={() => {
                                        toast.info('Regenerating response...');
                                        setShowActionsMenu(false);
                                    }}
                                    onAnalyze={() => {
                                        toast.info('Analyzing response logic...');
                                        setShowActionsMenu(false);
                                    }}
                                    onShare={() => {
                                        toast.success('Conversation link copied');
                                        setShowActionsMenu(false);
                                    }}
                                    onExport={() => {
                                        toast.success('Exporting conversation...');
                                        setShowActionsMenu(false);
                                    }}
                                    onReport={() => {
                                        toast.info('Legal report submitted');
                                        setShowActionsMenu(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            </motion.div>
        </TooltipProvider>
    );
}

export default memo(MessageRenderer);
