import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Copy, ThumbsUp, ThumbsDown, RefreshCw, Volume2,
    Share2, FileDown, AlertCircle, Sparkles, Check,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MessageActionMenuProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    modelName?: string;
    onCopy: () => void;
    onRegenerate?: () => void;
    onFeedback?: (type: 'good' | 'bad') => void;
    onReadAloud?: () => void;
    onShare?: () => void;
    onExport?: () => void;
    onReport?: () => void;
    onAnalyze?: () => void;
    className?: string;
}

export function MessageActionMenu({
    role,
    content,
    modelName,
    onCopy,
    onRegenerate,
    onFeedback,
    onReadAloud,
    onShare,
    onExport,
    onReport,
    onAnalyze,
    className
}: MessageActionMenuProps) {
    const isAssistant = role === 'assistant';
    const [copied, setCopied] = React.useState(false);
    const [feedback, setFeedback] = React.useState<'good' | 'bad' | null>(null);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFeedback = (type: 'good' | 'bad') => {
        setFeedback(type);
        onFeedback?.(type);
    };

    return (
        <TooltipProvider>
            <div className={cn("flex flex-col gap-2 p-1.5 min-w-[200px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl", className)}>
                {/* Circular Toolbar (Top Row) */}
                <div className="flex items-center justify-between px-1 mb-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onRegenerate}
                                className="h-9 w-9 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Regenerate</TooltipContent>
                    </Tooltip>

                    <div className="flex items-center gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleFeedback('good')}
                                    className={cn(
                                        "h-9 w-9 rounded-full hover:bg-white/10",
                                        feedback === 'good' ? "text-cyan-400 bg-cyan-400/10" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Good Response</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleFeedback('bad')}
                                    className={cn(
                                        "h-9 w-9 rounded-full hover:bg-white/10",
                                        feedback === 'bad' ? "text-red-400 bg-red-400/10" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Bad Response</TooltipContent>
                        </Tooltip>
                    </div>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onReadAloud}
                                className="h-9 w-9 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                            >
                                <Volume2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Read Aloud</TooltipContent>
                    </Tooltip>
                </div>

                {/* Main Action List */}
                <div className="flex flex-col gap-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="w-full justify-start gap-3 h-10 px-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white font-normal"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAnalyze}
                        className="w-full justify-start gap-3 h-10 px-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white font-normal"
                    >
                        <Search className="w-4 h-4" />
                        <span>Double-check response</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onShare}
                        className="w-full justify-start gap-3 h-10 px-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white font-normal"
                    >
                        <Share2 className="w-4 h-4" />
                        <span>Share conversation</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onExport}
                        className="w-full justify-start gap-3 h-10 px-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white font-normal"
                    >
                        <FileDown className="w-4 h-4" />
                        <span className="flex-1">Export to...</span>
                        <span className="text-[10px] text-gray-500">▶</span>
                    </Button>
                </div>

                {/* Footer Divider */}
                <div className="h-[1px] bg-white/5 my-1 mx-2" />

                {/* System Actions & Trace */}
                <div className="flex flex-col gap-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReport}
                        className="w-full justify-start gap-3 h-10 px-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-red-400 font-normal"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>Report legal issue</span>
                    </Button>

                    <div className="flex items-center gap-3 px-3 h-10 text-gray-500">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-medium">Model: <span className="text-gray-400">{modelName || 'System'}</span></span>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
