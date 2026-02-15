import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    X,
    Send,
    Bot,
    Minimize2,
    Maximize2,
    Paperclip,
    Copy,
    Check,
    Play,
    ArrowDown,
    MoreHorizontal,
    Square,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNexusChat } from '@/hooks/useNexus';
import { PreviewModal } from '@/components/PreviewModal';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageActionMenu } from '@/components/chat/MessageActionMenu';
import { QuickActionToolbar } from '@/components/chat/QuickActionToolbar';
import { textToSpeech } from '@/lib/ai';
import { FileUpload } from '@/components/input/FileUpload';
import { ResultRenderer } from '@/components/output/ResultRenderer';
import { InputData, AnalysisResult } from '@/components/input/types';
import { AI_MODELS, ModelKey } from '@/lib/ai';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-3 py-2 bg-white/5 rounded-2xl w-fit">
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
    </div>
);

const CodeBlock = ({ code, language, onPreview }: { code: string; language: string; onPreview: (code: string, lang: string) => void }) => {
    const [copied, setCopied] = useState(false);

    // Normalize language
    const lang = language.toLowerCase();
    const canPreview = ['html', 'css', 'javascript', 'js', 'markup', 'xml'].includes(lang);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-2 rounded-md overflow-hidden border border-white/10 bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase">{language || 'text'}</span>
                <div className="flex items-center gap-1">
                    {canPreview && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPreview(code, lang)}
                            className="h-6 px-2 text-[10px] hover:bg-white/10 text-cyan-400 gap-1"
                        >
                            <Play className="w-3 h-3" />
                            Preview
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-6 px-2 text-[10px] hover:bg-white/10 text-gray-400"
                    >
                        {copied ? (
                            <div className="flex items-center gap-1 text-green-400">
                                <Check className="w-3 h-3" />
                                Copied
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Copy className="w-3 h-3" />
                                Copy
                            </div>
                        )}
                    </Button>
                </div>
            </div>
            <pre className="p-3 overflow-x-auto text-xs font-mono text-gray-300">
                <code>{code}</code>
            </pre>
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AIChatWidgetContent() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [previewData, setPreviewData] = useState<{ code: string; language: string } | null>(null);
    const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        messages,
        sendMessage,
        stopGeneration,
        loading,
        streaming,
        error,
        activeModel,
        setActiveModel
    } = useNexusChat('planner');

    // Handle AI errors
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, loading]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if ((!input.trim() && attachments.length === 0) || loading) return;
        const msg = input.trim();
        const currentAttachments = [...attachments];

        setInput('');
        setAttachments([]);
        setShowFileUpload(false);

        await sendMessage(msg, currentAttachments);
    };

    const handleFilesSelected = (files: InputData[]) => {
        const newFiles = files.map(f => f.content as File);
        setAttachments(prev => [...prev, ...newFiles]);
    };

    const handlePreview = (code: string, language: string) => {
        setPreviewData({ code, language });
    };

    const handleDownloadImage = async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generated-image-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download image:', err);
            toast.error('Failed to download image');
        }
    };

    // Parse message content for code blocks and JSON results
    const renderContent = (content: string) => {
        // Try to parse as JSON for AnalysisResult
        try {
            if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
                const parsed = JSON.parse(content);
                // Simple heuristic to check if it's an AnalysisResult
                if (parsed.summary && (parsed.insights || parsed.content)) {
                    // It looks like an analysis result
                    const result: AnalysisResult = {
                        id: `res-${Date.now()}`,
                        type: 'data_insights', // Default or infer
                        status: 'completed',
                        progress: 100,
                        inputId: 'unknown',
                        summary: parsed.summary,
                        content: parsed.content || '',
                        insights: parsed.insights || [],
                        data: parsed.data,
                        visualizations: parsed.visualizations,
                        recommendations: parsed.recommendations,
                        metadata: {
                            processingTime: 0,
                            modelUsed: 'analyst',
                            confidence: 0.9,
                            timestamp: new Date()
                        }
                    };
                    return <ResultRenderer result={result} />;
                }
            }
        } catch (e) {
            // Not JSON
        }

        // Check if content is a single image URL (including base64 data URLs)
        const isImageUrl = (
            content.startsWith('data:image/') || // Base64 data URL
            (/^(http|https):\/\/[^ "]+$/.test(content) && (/\.(jpg|jpeg|png|webp|gif)$/i.test(content) || content.includes('pollinations.ai') || content.includes('openrouter')))
        );

        if (isImageUrl) {
            return (
                <div className="relative group mt-2 rounded-lg overflow-hidden border border-white/10">
                    <img
                        src={content}
                        alt="AI Generated"
                        className="w-full h-auto object-cover max-h-[300px]"
                    />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full bg-black/60 text-white hover:bg-black/80" onClick={() => handleDownloadImage(content)}>
                            <Check className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            );
        }

        const parts = content.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i) => {
            if (part.startsWith('```')) {
                const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                if (match) {
                    return (
                        <CodeBlock
                            key={i}
                            code={match[2].trim()}
                            language={match[1] || ''}
                            onPreview={handlePreview}
                        />
                    );
                }
            }
            // Simple inline code and text
            return (
                <span key={i} className="whitespace-pre-wrap">
                    {part.split(/(`[^`]+`)/g).map((seg, j) => {
                        if (seg.startsWith('`') && seg.endsWith('`')) {
                            return <code key={j} className="bg-white/10 px-1 py-0.5 rounded text-cyan-300 font-mono text-xs">{seg.slice(1, -1)}</code>;
                        }
                        return seg;
                    })}
                </span>
            );
        });
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    fixed bottom-6 right-6 z-50 
                    w-14 h-14 rounded-full shadow-2xl
                    flex items-center justify-center
                    border border-white/10 backdrop-blur-md
                    transition-all duration-300
                    ${isOpen ? 'bg-[#0a0a0a] text-white' : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'}
                `}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-8 h-8" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <h3 className="font-semibold text-gray-100 text-sm">G-Nexus</h3>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-5 px-1.5 gap-1 text-[10px] text-gray-400 hover:text-white ml-1 bg-white/5 rounded-full border border-white/5 hover:bg-white/10">
                                                    {AI_MODELS[activeModel]?.name || activeModel}
                                                    <ChevronDown className="w-2.5 h-2.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-[200px] bg-[#1a1a1a] border-white/10">
                                                {Object.entries(AI_MODELS)
                                                    .filter(([_, config]) => !config.fallback) // Only show main categories/models
                                                    .map(([key, config]) => (
                                                        <DropdownMenuItem
                                                            key={key}
                                                            onClick={() => setActiveModel(key as ModelKey)}
                                                            className={cn(
                                                                "flex items-center justify-between text-xs cursor-pointer hover:bg-white/5",
                                                                activeModel === key && "bg-cyan-500/10 text-cyan-400"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                                                                {config.name}
                                                            </div>
                                                            {activeModel === key && <Check className="w-3 h-3" />}
                                                        </DropdownMenuItem>
                                                    ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] text-green-400 font-mono">ONLINE</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
                                <Minimize2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>How can I help you build today?</p>
                                    </div>
                                )}

                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex group flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`
                                                relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                                                ${msg.role === 'user'
                                                    ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                                                    : 'bg-white/10 text-gray-200 rounded-tl-sm'
                                                }
                                            `}
                                        >
                                            {/* Top Corner More Options Button */}
                                            {msg.role === 'assistant' && (
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 p-0"
                                                            >
                                                                <MoreHorizontal className="w-3 h-3 rotate-90" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-fit p-0 bg-transparent border-none shadow-none" align="end">
                                                            <MessageActionMenu
                                                                role={msg.role}
                                                                modelName={msg.model}
                                                                onCopy={async () => {
                                                                    await navigator.clipboard.writeText(msg.content);
                                                                    toast.success('Copied to clipboard');
                                                                }}
                                                                onReadAloud={async () => {
                                                                    toast.info('Synthesizing speech...');
                                                                    try {
                                                                        const response = await textToSpeech(msg.content);
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
                                                                    toast.success('Thanks for your feedback!');
                                                                }}
                                                                onRegenerate={() => {
                                                                    toast.info('Regenerating response...');
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            )}

                                            {renderContent(msg.content)}

                                            {/* Corner Copy Button */}
                                            {msg.role === 'assistant' && (
                                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={async () => {
                                                            await navigator.clipboard.writeText(msg.content);
                                                            toast.success('Copied to clipboard');
                                                        }}
                                                        className="h-6 w-6 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 p-0"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reasoning / Thinking Process */}
                                        {msg.role === 'assistant' && msg.reasoning && (
                                            <div className="mt-2 text-xs text-gray-500 max-w-[85%] px-4">
                                                <details className="cursor-pointer group/details">
                                                    <summary className="list-none flex items-center gap-1 hover:text-gray-400 transition-colors">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover/details:bg-cyan-500 transition-colors" />
                                                        Thinking Process
                                                        <ArrowDown className="w-3 h-3 opacity-0 group-open/details:opacity-100 transition-opacity" />
                                                    </summary>
                                                    <div className="mt-2 pl-3 border-l-2 border-white/10 text-gray-400 font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                                                        {msg.reasoning}
                                                    </div>
                                                </details>
                                            </div>
                                        )}

                                        {/* Actions Menu */}
                                        {
                                            msg.role !== 'system' && (
                                                <div className={cn(
                                                    'absolute bottom-0 translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2',
                                                    msg.role === 'user' ? 'right-2' : 'left-2'
                                                )}>
                                                    <Popover open={showActionsMenu === msg.id} onOpenChange={(open) => setShowActionsMenu(open ? msg.id : null)}>
                                                        <QuickActionToolbar
                                                            role={msg.role}
                                                            content={msg.content}
                                                            onCopy={async () => {
                                                                await navigator.clipboard.writeText(msg.content);
                                                                toast.success('Copied to clipboard');
                                                            }}
                                                            onReadAloud={async () => {
                                                                toast.info('Synthesizing speech...');
                                                                try {
                                                                    const response = await textToSpeech(msg.content);
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
                                                                toast.success('Thanks for your feedback!');
                                                            }}
                                                            onRegenerate={msg.role === 'assistant' ? () => {
                                                                toast.info('Regenerating response...');
                                                            } : undefined}
                                                            onMore={() => setShowActionsMenu(msg.id)}
                                                        />

                                                        <PopoverTrigger asChild>
                                                            <span className="sr-only">Open menu</span>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-fit p-0 bg-transparent border-none shadow-none" align={msg.role === 'user' ? 'end' : 'start'}>
                                                            <MessageActionMenu
                                                                role={msg.role}
                                                                modelName={msg.model}
                                                                onCopy={async () => {
                                                                    await navigator.clipboard.writeText(msg.content);
                                                                    toast.success('Copied to clipboard');
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                onReadAloud={async () => {
                                                                    toast.info('Synthesizing speech...');
                                                                    try {
                                                                        const response = await textToSpeech(msg.content);
                                                                        if (response.success && response.data) {
                                                                            const audio = new Audio(response.data);
                                                                            audio.play();
                                                                            toast.success('Playing audio');
                                                                        }
                                                                    } catch (err) {
                                                                        toast.error('Error playing audio');
                                                                    }
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                onFeedback={(type) => {
                                                                    toast.success('Thanks for your feedback!');
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                onRegenerate={() => {
                                                                    toast.info('Regenerating response...');
                                                                    setShowActionsMenu(null);
                                                                }}
                                                                onAnalyze={() => {
                                                                    toast.info('Analyzing response logic...');
                                                                    setShowActionsMenu(null);
                                                                }}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            )
                                        }
                                    </motion.div>
                                ))}

                                {(loading || streaming) && (
                                    <div className="flex justify-start">
                                        <TypingIndicator />
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* File Upload Area */}
                        <AnimatePresence>
                            {showFileUpload && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-white/10 bg-black/20"
                                >
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-400">Attach Files</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowFileUpload(false)}
                                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <FileUpload
                                            onFilesSelected={handleFilesSelected}
                                            config={{ maxFileSize: 10 * 1024 * 1024 }}
                                            className="w-full"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Selected Files Preview (Compact) */}
                        {attachments.length > 0 && !showFileUpload && (
                            <div className="px-3 py-2 border-t border-white/10 bg-black/20 flex gap-2 overflow-x-auto">
                                {attachments.map((file, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded text-xs text-gray-300 shrink-0">
                                        <span className="truncate max-w-[100px]">{file.name}</span>
                                        <button
                                            onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                            className="hover:text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setShowFileUpload(true)}
                                    className="flex items-center gap-1 bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs hover:bg-cyan-500/30"
                                >
                                    <Plus className="w-3 h-3" /> Add
                                </button>
                            </div>
                        )}

                        <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center gap-2"
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={`h-9 w-9 shrink-0 ${showFileUpload || attachments.length > 0 ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setShowFileUpload(!showFileUpload)}
                                >
                                    <Paperclip className="w-4 h-4" />
                                </Button>

                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />

                                {loading || streaming ? (
                                    <Button
                                        type="button"
                                        onClick={stopGeneration}
                                        className="h-9 w-9 rounded-xl p-0 shrink-0 bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                                    >
                                        <Square className="w-4 h-4 fill-white" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={(!input.trim() && attachments.length === 0)}
                                        className={`
                                            h-9 w-9 rounded-xl p-0 shrink-0 transition-all
                                            ${(input.trim() || attachments.length > 0)
                                                ? 'bg-cyan-500 hover:bg-cyan-400 text-white'
                                                : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                )}
                            </form>
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence>

            {/* Preview Modal */}
            < PreviewModal
                isOpen={!!previewData
                }
                onClose={() => setPreviewData(null)}
                code={previewData?.code || ''}
                language={previewData?.language || ''}
            />


        </>
    );
}
