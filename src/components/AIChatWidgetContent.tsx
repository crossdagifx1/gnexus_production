import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNexusChat } from '@/hooks/useNexus';
import { PreviewModal } from '@/components/PreviewModal';
import { toast } from 'sonner';
// AdvancedImagePreview import removed

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
    const [previewData, setPreviewData] = useState<{ code: string; language: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        messages,
        sendMessage,
        loading,
        streaming,
        error
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
        if (!input.trim() || loading) return;
        const msg = input.trim();
        setInput('');
        await sendMessage(msg);
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



    // Parse message content for code blocks
    const renderContent = (content: string) => {
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
                                <div>
                                    <h3 className="font-semibold text-gray-100 text-sm">G-Nexus Assistant</h3>
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
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`
                                                max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                                                ${msg.role === 'user'
                                                    ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                                                    : 'bg-white/10 text-gray-200 rounded-tl-sm'
                                                }
                                            `}
                                        >
                                            {renderContent(msg.content)}
                                        </div>
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

                        {/* Input Area */}
                        <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center gap-2"
                            >
                                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white shrink-0">
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

                                <Button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className={`
                                        h-9 w-9 rounded-xl p-0 shrink-0 transition-all
                                        ${input.trim()
                                            ? 'bg-cyan-500 hover:bg-cyan-400 text-white'
                                            : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={!!previewData}
                onClose={() => setPreviewData(null)}
                code={previewData?.code || ''}
                language={previewData?.language || ''}
            />


        </>
    );
}
