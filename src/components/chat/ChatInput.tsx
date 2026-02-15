/**
 * ChatInput Component
 * Enhanced chat input with multi-line support, attachments, and voice input
 */

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Paperclip, Mic, MicOff, Image, FileText, X, Sparkles,
    Smile, StickyNote, Calculator, Calendar, Code, Search, Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatInputProps {
    onSend: (message: string) => void;
    onVoiceInput?: (transcript: string) => void;
    onStop?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
    className?: string;
}

interface Suggestion {
    icon: React.ReactNode;
    label: string;
    prompt: string;
    category: string;
}

const quickActions: Suggestion[] = [
    { icon: <Wand2 className="w-4 h-4" />, label: 'Generate Code', prompt: 'Write a function to', category: 'code' },
    { icon: <Search className="w-4 h-4" />, label: 'Search', prompt: 'Search for', category: 'search' },
    { icon: <StickyNote className="w-4 h-4" />, label: 'Summarize', prompt: 'Summarize this:', category: 'summarize' },
    { icon: <Calculator className="w-4 h-4" />, label: 'Calculate', prompt: 'Calculate', category: 'math' },
    { icon: <Calendar className="w-4 h-4" />, label: 'Plan', prompt: 'Create a plan for', category: 'planning' },
    { icon: <Code className="w-4 h-4" />, label: 'Debug', prompt: 'Debug this code:', category: 'debug' },
];

export function ChatInput({
    onSend,
    onVoiceInput,
    onStop,
    isLoading = false,
    disabled = false,
    placeholder = 'Type your message...',
    maxLength = 10000,
    className,
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [message]);

    // Handle send
    const handleSend = useCallback(() => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled) return;

        onSend(trimmedMessage);
        setMessage('');
        setAttachment(null);

        // Focus back on textarea
        setTimeout(() => textareaRef.current?.focus(), 50);
    }, [message, onSend, disabled]);

    // Handle key down
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Cmd/Ctrl + Enter
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }

        // Handle tab for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;
            setMessage((prev) => prev.substring(0, start) + '    ' + prev.substring(end));
            // Move cursor
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                }
            }, 0);
        }
    }, [handleSend]);

    // Handle voice input
    const toggleRecording = useCallback(async () => {
        if (!onVoiceInput) {
            toast.error('Voice input not available');
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            // In a real implementation, this would stop recording and process the audio
            toast.info('Voice recording stopped');
        } else {
            // Request microphone permission and start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(true);
                toast.info('Recording...');
            } catch (err) {
                toast.error('Could not access microphone');
            }
        }
    }, [isRecording, onVoiceInput]);

    // Handle file selection
    const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setAttachment(file);
            setMessage((prev) => prev + `[Attached: ${file.name}]`);
        }
    }, []);

    // Handle quick action
    const handleQuickAction = useCallback((action: Suggestion) => {
        setMessage(action.prompt + ' ');
        setShowSuggestions(false);
        textareaRef.current?.focus();
    }, []);

    // Quick action button variants
    const quickActionColors: Record<string, string> = {
        code: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
        search: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
        summarize: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
        math: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
        planning: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30',
        debug: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
    };

    const charCount = message.length;
    const isNearLimit = charCount > maxLength * 0.9;
    const isOverLimit = charCount > maxLength;

    return (
        <TooltipProvider>
            <div className={cn('relative', className)}>
                {/* Quick Actions Bar */}
                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl shadow-xl"
                        >
                            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                                Quick Actions
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.category}
                                        onClick={() => handleQuickAction(action)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                                            quickActionColors[action.category] || 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        )}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Container */}
                <div className={cn(
                    'relative bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg',
                    'focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20',
                    isOverLimit && 'border-red-500/50'
                )}>
                    {/* Attachment Preview */}
                    <AnimatePresence>
                        {attachment && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-4 pt-3 border-b border-white/10"
                            >
                                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="flex-1 text-sm text-gray-300 truncate">
                                        {attachment.name}
                                    </span>
                                    <button
                                        onClick={() => setAttachment(null)}
                                        className="p-1 hover:bg-white/10 rounded"
                                    >
                                        <X className="w-3 h-3 text-gray-400" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Text Input */}
                    <div className="flex items-end gap-2 p-3">
                        {/* Left Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10"
                                        onClick={() => setShowSuggestions(!showSuggestions)}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Quick Actions</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Attach File</TooltipContent>
                            </Tooltip>

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,.pdf,.txt,.md,.json,.js,.ts,.html,.css"
                            />
                        </div>

                        {/* Text Area */}
                        <Textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={cn(
                                'flex-1 bg-transparent border-0 resize-none focus:outline-none',
                                'text-white placeholder:text-gray-500',
                                'min-h-[44px] max-h-[200px] py-2',
                                'text-sm leading-relaxed'
                            )}
                            rows={1}
                        />

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                            {/* Voice Input */}
                            {onVoiceInput && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                'h-9 w-9 hover:bg-white/10',
                                                isRecording ? 'text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'
                                            )}
                                            onClick={toggleRecording}
                                        >
                                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isRecording ? 'Stop Recording' : 'Voice Input'}
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {/* Send/Stop Button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        disabled={(!message.trim() && !isLoading) || disabled || isOverLimit}
                                        onClick={isLoading ? onStop : handleSend}
                                        className={cn(
                                            'h-9 w-9 rounded-lg transition-all',
                                            isLoading
                                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                                : (message.trim() && !disabled && !isOverLimit)
                                                    ? 'bg-cyan-500 hover:bg-cyan-400 text-white'
                                                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                        )}
                                    >
                                        {isLoading ? <span className="h-3 w-3 bg-white rounded-sm" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isLoading ? 'Stop Generation' : 'Send Message (Ctrl + Enter)'}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Character Count */}
                    <div className={cn(
                        'flex justify-end px-3 pb-2 text-xs',
                        isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-500'
                    )}>
                        {charCount.toLocaleString()} / {maxLength.toLocaleString()}
                    </div>
                </div>

                {/* Voice Recording Indicator */}
                <AnimatePresence>
                    {isRecording && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 right-0 mb-2 flex items-center justify-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl"
                        >
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm text-red-400">Recording... Speak now</span>
                            <button
                                onClick={toggleRecording}
                                className="ml-2 px-3 py-1 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-xs text-red-300"
                            >
                                Stop
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
}

export default ChatInput;
